import { S3 } from 'aws-sdk'
import log from 'fancy-log'
import { createWriteStream, promises as fs, Stats } from 'fs'
import memoize from 'lodash/memoize'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import { IServiceOpts } from './awsServiceOptions'

const streamFinished = promisify(stream.finished)

interface ISyncOptions {
  serviceOpts: IServiceOpts
  bucket: string
  useAccelerateEndpoint?: boolean
}

interface IPathPair {
  s3Path: string
  cachePath: string
}

const ensureTrailingSlash = (dirPath: string) => {
  if (dirPath.endsWith('/')) {
    return dirPath
  }
  return `${dirPath}/`
}

export default ({
  serviceOpts,
  bucket,
  useAccelerateEndpoint = true,
}: ISyncOptions) => {
  const s3 = new S3({
    ...serviceOpts,
    useAccelerateEndpoint,
  })

  const sync = {
    file: memoize(
      async ({ s3Path, cachePath }: IPathPair) => {
        let stat: Stats | null
        try {
          stat = await fs.stat(cachePath)
        } catch (e) {
          if (e.code !== 'ENOENT') {
            throw e
          }
          await fs.mkdir(path.dirname(cachePath), { recursive: true })
          stat = null
        }
        const s3Params = {
          Bucket: bucket,
          Key: s3Path,
        }
        const head = await s3.headObject(s3Params).promise()
        const updateReason = !stat
          ? "The local file doesn't exist"
          : head.LastModified! > stat.mtime
          ? 'The remote file is newer'
          : head.ContentLength! !== stat.size
          ? 'The remote file is a different size'
          : null
        if (updateReason) {
          const sizeMiB = Math.round(head.ContentLength! / 2 ** 20)
          log(
            `Downloading ${cachePath} of ${sizeMiB}MiB because: ${updateReason}`,
          )
          await streamFinished(
            s3
              .getObject(s3Params)
              .createReadStream()
              .pipe(createWriteStream(cachePath)),
          )
        }
      },
      ({ cachePath }: IPathPair) => cachePath,
    ),

    dir: async ({ s3Path, cachePath }: IPathPair) => {
      const s3Dir = ensureTrailingSlash(s3Path)
      const cacheDir = ensureTrailingSlash(cachePath)
      const listResult = await s3
        .listObjectsV2({ Bucket: bucket, Prefix: s3Dir })
        .promise()
      if (listResult.IsTruncated) {
        throw new Error('Not implemented yet: paginated results')
      }
      if (listResult.Contents) {
        await Promise.all(
          listResult.Contents.map(async ({ Key }) => {
            if (!Key) {
              return
            }
            const suffix = Key.substring(s3Dir.length)
            if (!suffix) {
              return
            }
            await sync.file({
              s3Path: s3Dir + suffix,
              cachePath: cacheDir + suffix,
            })
          }),
        )
      }
    },
  }
  return sync
}