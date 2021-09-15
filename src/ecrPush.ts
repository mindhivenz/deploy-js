import log from 'fancy-log'
import { highlight } from './colors'
import awsCredentialsEnv from './awsCredentialsEnv'
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
  if (tagWithGitHash) {
    const hash = await gitHash(gitRepoPath, { gitUpToDate: true })
    const hashTag =
      remoteImageTag === 'latest'
        ? `git-${hash}`
        : `${remoteImageTag}-git-${hash}`
    tags.push(hashTag)
  } else {
    if (tags.length === 0) {
      tags.push('latest')
    }
  }
  for (const tag of tags) {
    await execFile('docker', ['tag', localImageTag, `${repo}:${tag}`])
  }
  const awsEnv = await awsCredentialsEnv(ecrOptions)
  for (const tag of tags) {
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
