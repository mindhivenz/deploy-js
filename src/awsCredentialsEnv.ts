import { credentialsEnv } from './internal/awsEnv'
import { projCredentialsFactory } from './internal/awsProjCredentials'
import { IProjOptions } from './internal/awsProjOptions'

interface IOptions extends IProjOptions {
  region?: string
}

export default async ({ region, ...projOptions }: IOptions) => {
  const credentials = projCredentialsFactory(projOptions)
  return await credentialsEnv(credentials, { region })
}
