import { AWSError, S3 } from 'aws-sdk'
import log from 'fancy-log'
import { createWriteStream, promises as fs, Stats } from 'fs'
import memoize from 'lodash/memoize'
import pLimit from 'p-limit'
import path from 'path'
import PluginError from 'plugin-error'
import stream from 'stream'
import { promisify } from 'util'
import { IServiceOpts } from './awsServiceOptions'
import { highlight, url } from './colors'
import { globalArgs } from './internal/args'
import ErrnoException = NodeJS.ErrnoException

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

interface IDirOptions extends IPathPair {
  purgeLocal: boolean
}

const ensureTrailingSlash = (dirPath: string) => {
  if (dirPath.endsWith('/')) {
    return dirPath
  }
  return `${dirPath}/`
}

const stripTrailingSlash = (dirPath: string) => {
  if (dirPath.endsWith('/')) {
    return dirPath.substr(0, dirPath.length - 1)
  }
  return dirPath
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

  const headLimit = pLimit(16)
  const getLimit = pLimit(8)

  const sync = {
    file: memoize(
      async ({ s3Path, cachePath }: IPathPair) => {
        const { verbose } = await globalArgs.argv
        let stat: Stats | null
        try {
          stat = await fs.stat(cachePath)
        } catch (e) {
          if ((e as ErrnoException).code !== 'ENOENT') {
            throw e
          }
          await fs.mkdir(path.dirname(cachePath), { recursive: true })
          stat = null
        }
        const s3Params = {
          Bucket: bucket,
          Key: s3Path,
        }
        let head: S3.HeadObjectOutput
        try {
          head = await headLimit(() => s3.headObject(s3Params).promise())
        } catch (e) {
          if ((e as AWSError).code === 'NotFound') {
            throw new PluginError(
              '@mindhive/deploy/syncS3',
              `S3 object not found in bucket: ${bucket}, path: ${s3Path}`,
            )
          }
          throw e
        }
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
            `Downloading ${highlight(
              cachePath,
            )} of ${sizeMiB}MiB because: ${updateReason}`,
          )
          await getLimit(() =>
            streamFinished(
              s3
                .getObject(s3Params)
                .createReadStream()
                .pipe(createWriteStream(cachePath)),
            ),
          )
        } else {
          if (verbose) {
            log(`Skipping ${highlight(cachePath)} as up to date`)
          }
        }
      },
      ({ cachePath }: IPathPair) => cachePath,
    ),

    dir: async ({ s3Path, cachePath, purgeLocal }: IDirOptions) => {
      const s3Dir = ensureTrailingSlash(s3Path)
      const cacheDir = ensureTrailingSlash(cachePath)
      const contents: S3.Object[] = []
      let token: string | undefined
      do {
        try {
          const listResult = await s3
            .listObjectsV2({
              Bucket: bucket,
              Prefix: s3Dir,
              ContinuationToken: token,
            })
            .promise()
          if (listResult.Contents) {
            contents.push(...listResult.Contents)
          }
          token = listResult.NextContinuationToken
        } catch (e) {
          if ((e as AWSError).code === 'NotFound') {
            throw new PluginError(
              '@mindhive/deploy/syncS3',
              `No S3 objects not found under bucket: ${bucket}, prefix: ${s3Dir}`,
            )
          }
          throw e
        }
      } while (token)
      if (!contents.length) {
        log(`Remote ${url(`s3://${bucket}/${s3Dir}`)} is empty`)
        return
      }
      const suffixes = contents.flatMap(({ Key }) => {
        if (!Key) {
          return []
        }
        const suffix = Key.substring(s3Dir.length)
        if (!suffix) {
          return []
        }
        return [suffix]
      })
      if (purgeLocal) {
        try {
          const localEntries = await fs.readdir(stripTrailingSlash(cacheDir), {
            withFileTypes: true,
          })
          await Promise.all(
            localEntries.map(async (entry) => {
              if (
                !suffixes.some(
                  (suffix) =>
                    suffix === entry.name ||
                    suffix.startsWith(`${entry.name}/`),
                )
              ) {
                const localPath = path.join(cacheDir, entry.name)
                log(`Removing ${highlight(localPath)} as no longer on server`)
                if (entry.isDirectory()) {
                  await fs.rmdir(localPath, {
                    recursive: true,
                  })
                } else {
                  await fs.unlink(localPath)
                }
              }
            }),
          )
        } catch (e) {
          if ((e as ErrnoException).code !== 'ENOENT') {
            throw e
          }
        }
      }
      await Promise.all(
        suffixes.map(async (suffix) => {
          await sync.file({
            s3Path: s3Dir + suffix,
            cachePath: path.join(cacheDir, suffix),
          })
        }),
      )
    },
  }
  return sync
}
