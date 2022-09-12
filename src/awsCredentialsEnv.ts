import { IProjOptions } from './awsProjOptions'
import { credentialsEnv } from './internal/awsEnv'
import { projCredentialsFactory } from './internal/awsProjCredentials'

export interface IAwsCredentialsEnvOptions extends IProjOptions {
  region?: string
}

export default async ({
  region,
  ...projOptions
}: IAwsCredentialsEnvOptions) => {
  const credentials = projCredentialsFactory(projOptions)
  return await credentialsEnv(credentials, { region })
}
