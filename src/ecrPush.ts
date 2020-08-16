import awsCredentialsEnv from './awsCredentialsEnv'
import ecrImageRepo from './ecrImageRepo'
import execFile from './execFile'
import { IOptions as IEcrOptions } from './internal/ecr'
import setEcrCredentialHelper from './setEcrCredentialHelper'

interface IOptions extends IEcrOptions {
  localImageTag: string
  repoName: string
  remoteImageTag?: string
}

export default async ({
  localImageTag,
  repoName,
  remoteImageTag,
  ...ecrOptions
}: IOptions) => {
  const repo = await ecrImageRepo({ name: repoName, ...ecrOptions })
  const ecrImageTag = remoteImageTag ? `${repo}:${remoteImageTag}` : repo
  await setEcrCredentialHelper(ecrOptions)
  await execFile('docker', ['tag', localImageTag, ecrImageTag])
  const awsEnv = await awsCredentialsEnv(ecrOptions)
  await execFile('docker', ['push', ecrImageTag], {
    env: {
      ...process.env,
      ...awsEnv,
    },
    pipeOutput: true,
  })
}
