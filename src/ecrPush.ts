import log from 'fancy-log'
import awsCredentialsEnv from './awsCredentialsEnv'
import { highlight } from './colors'
import ecrImageRepo from './ecrImageRepo'
import execFile from './execFile'
import gitBranch from './gitBranch'
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
  remoteImageTag = '',
  tagWithGitHash = false,
  gitRepoPath,
  ...repoHostOptions
}: IOptions) => {
  const repo = await ecrImageRepo({ name: repoName, ...repoHostOptions })
  if (!process.env.CI) {
    await setEcrCredentialHelper(repoHostOptions)
  }
  const tags = []
  const awsEnv = await awsCredentialsEnv(repoHostOptions)

  if (remoteImageTag) {
    tags.push(remoteImageTag)
  }

  const branch = await gitBranch(gitRepoPath, { gitUpToDate: true })
  if (['master', 'main', 'production'].includes(branch)) {
    tags.push("latest")
  } else {
    tags.push(branch.replace(/[^a-zA-Z0-9-_.]/g, '_').substring(0, 128))
  }

  if (tagWithGitHash) {
    const hashTag = await gitHash(gitRepoPath, { gitUpToDate: true })
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
      log(`There is already an image with git hashtag: ${highlight(
        `${repo}:${hashTag}`,
      )}`,
      )
    }
    // Put hashTag first to ensure if latest is added, then the git hash is already there
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
