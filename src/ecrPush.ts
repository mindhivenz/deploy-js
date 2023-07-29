import log from 'fancy-log'
import PluginError from 'plugin-error'
import awsCredentialsEnv from './awsCredentialsEnv'
import { highlight } from './colors'
import ecrImageRepo from './ecrImageRepo'
import execFile from './execFile'
import gitHash from './gitHash'
import { IOptions as IEcrOptions } from './internal/ecr'
import setEcrCredentialHelper from './setEcrCredentialHelper'

interface IOptions extends IEcrOptions {
  localImageTag: string
  repoName: string
  remoteImageTag?: string
  tagWithGitHash?: boolean
  gitRepoPath?: string
}

export default async ({
  localImageTag,
  repoName,
  remoteImageTag = 'latest',
  tagWithGitHash = false,
  gitRepoPath,
  ...ecrOptions
}: IOptions) => {
  const repo = await ecrImageRepo({ name: repoName, ...ecrOptions })
  await setEcrCredentialHelper(ecrOptions)
  const tags = [remoteImageTag]
  const awsEnv = await awsCredentialsEnv(ecrOptions)
  if (tagWithGitHash) {
    const hash = await gitHash(gitRepoPath, { gitUpToDate: true })
    const hashTag =
      remoteImageTag === 'latest' ? hash : `${remoteImageTag}-${hash}`
    const { exitCode } = await execFile(
      'docker',
      ['manifest', 'inspect', `${repo}:${hashTag}`],
      {
        env: {
          ...process.env,
          ...awsEnv,
        },
        okExitCodes: [0, 1],
      },
    )
    if (exitCode === 0) {
      throw new PluginError(
        '@mindhive/deploy/ecrPush',
        `There is already an image with git hashtag: ${highlight(
          `${repo}:${hashTag}`,
        )}`,
      )
    }
    tags.push(hashTag) // Put hashTag last to ensure if it's put it will be latest
  } else {
    if (tags.length === 0) {
      tags.push('latest')
    }
  }
  for (const tag of tags) {
    await execFile('docker', ['tag', localImageTag, `${repo}:${tag}`])
    await execFile('docker', ['push', `${repo}:${tag}`], {
      env: {
        ...process.env,
        ...awsEnv,
      },
      pipeOutput: true,
    })
  }
  const conciseRemotes = tags
    .map((tag, i) => highlight(i === 0 ? `${repo}:${tag}` : `:${tag}`))
    .join(', ')
  log(`Pushed ${highlight(localImageTag)} -> ${conciseRemotes}`)
}
