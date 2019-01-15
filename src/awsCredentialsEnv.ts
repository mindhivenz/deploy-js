import { IOptions, projCredentialsFactory } from './internal/awsCredentials'

export default async (options: IOptions) => {
  const credentials = projCredentialsFactory(options)
  await credentials.getPromise()
  return {
    AWS_ACCESS_KEY_ID: credentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    AWS_SESSION_TOKEN: credentials.sessionToken,
  }
}
