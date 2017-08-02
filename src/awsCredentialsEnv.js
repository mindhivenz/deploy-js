import { proj as credentialsFactory } from './awsCredentials'


export default async ({ proj, stage }) => {
  const credentials = credentialsFactory({ proj, stage })
  await credentials.getPromise()
  return {
    AWS_ACCESS_KEY_ID: credentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    AWS_SESSION_TOKEN: credentials.sessionToken,
  }
}
