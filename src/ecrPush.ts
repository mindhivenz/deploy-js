import log from 'fancy-log'
import PluginError from 'plugin-error'
import awsCredentialsEnv from './awsCredentialsEnv'
import { highlight } from './colors'
import ecrImageRepo from './ecrImageRepo'
import execFile from './execFile'
import gitHash from './gitHash'
import { IRepoHostOptions } from './internal/ecr'
import setEcrCredentialHelper from './setEcrCredentialHelper'

interface IOptions extends IRepoHostOptions {
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
  ...repoHostOptions
}: IOptions) => {
  const repo = await ecrImageRepo({ name: repoName, ...repoHostOptions })
  if (!process.env.CI) {
    await setEcrCredentialHelper(repoHostOptions)
  }
  const tags = [remoteImageTag]
  const awsEnv = await awsCredentialsEnv(repoHostOptions)
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
    // Put hashTag first to ensure if remoteImageTag is added, then the git hash has to as well
    tags.splice(0, 0, hashTag)
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
