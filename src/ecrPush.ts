import awsCredentialsEnv from './awsCredentialsEnv'
import execFile from './execFile'
import { IOptions as IEcrOptions } from './internal/ecr'
import setEcrCredentialHelper from './setEcrCredentialHelper'

interface IOptions extends IEcrOptions {
  localImageTag: string
  ecrImageTag: string
}

export default async ({
  localImageTag,
  ecrImageTag,
  ...ecrOptions
}: IOptions) => {
  await setEcrCredentialHelper(ecrOptions)
  await execFile('docker', ['tag', localImageTag, ecrImageTag])
  const awsEnv = await awsCredentialsEnv(ecrOptions)
  await execFile('docker', ['push', ecrImageTag], {
    env: {
      ...process.env,
      ...awsEnv,
    },
  })
}
