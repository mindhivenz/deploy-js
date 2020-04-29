import { Credentials } from 'aws-sdk'

export interface IOptions {
  region?: string
}

export const credentialsEnv = async (
  credentials: Credentials,
  { region }: IOptions,
) => {
  await credentials.getPromise()
  return {
    AWS_ACCESS_KEY_ID: credentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    AWS_SESSION_TOKEN: credentials.sessionToken,
    ...(region ? { AWS_REGION: region } : {}),
  }
}
