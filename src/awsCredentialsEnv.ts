import { credentialsEnv } from './internal/awsEnv'
import {
  IOptions as IProjOptions,
  projCredentialsFactory,
} from './internal/awsProjCredentials'

interface IOptions extends IProjOptions {
  region?: string
}

export default async ({ region, ...projOptions }: IOptions) => {
  const credentials = projCredentialsFactory(projOptions)
  return await credentialsEnv(credentials, { region })
}
