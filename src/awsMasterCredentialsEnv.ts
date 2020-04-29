import { IOptions, credentialsEnv } from './internal/awsEnv'
import { master } from './internal/awsMasterCredentials'

export default async ({ region }: IOptions) =>
  await credentialsEnv(master, { region })
