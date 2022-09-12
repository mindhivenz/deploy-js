import AWS from 'aws-sdk'
import memoize from 'lodash/memoize'
import { projCredentialsFactory } from './internal/awsProjCredentials'
import { IProjOptions } from './awsProjOptions'

const getAccountId = async (options: IProjOptions): Promise<string> => {
  const credentials = projCredentialsFactory(options)
  const sts = new AWS.STS({ credentials })
  const result = await sts.getCallerIdentity({}).promise()
  if (!result.Account) {
    throw new Error(`Unexpected no account returned`)
  }
  return result.Account
}

export default memoize(
  getAccountId,
  ({ proj, stage }) => `${proj}/${stage}`,
) as typeof getAccountId
