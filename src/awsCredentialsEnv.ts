import {
  IOptions as IProjOptions,
  projCredentialsFactory,
} from './internal/awsProjCredentials'

interface IOptions extends IProjOptions {
  region?: string
}

export default async ({ region, ...projOptions }: IOptions) => {
  const credentials = projCredentialsFactory(projOptions)
  await credentials.getPromise()
  return {
    AWS_ACCESS_KEY_ID: credentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    AWS_SESSION_TOKEN: credentials.sessionToken,
    ...(region ? { AWS_DEFAULT_REGION: region } : {}),
  }
}
