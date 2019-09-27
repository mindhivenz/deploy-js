import STS from 'aws-sdk/clients/sts'
import memoize from 'lodash/memoize'
import { IOptions, projCredentialsFactory } from './internal/awsProjCredentials'

const getAccountId = async (options: IOptions): Promise<string> => {
  const credentials = projCredentialsFactory(options)
  const sts = new STS({ credentials })
  const result = await sts.getCallerIdentity({}).promise()
  if (!result.Account) {
    throw new Error(`Unexpected no account returned`)
  }
  return result.Account
}

export default memoize(getAccountId, ({ proj, stage }) => `${proj}/${stage}`)
