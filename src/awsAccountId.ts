import STS from 'aws-sdk/clients/sts'
import memoize from 'lodash/memoize'
import { IOptions, projCredentialsFactory } from './internal/awsCredentials'

const getAccountId = async (options: IOptions) => {
  const credentials = projCredentialsFactory(options)
  const sts = new STS({ credentials })
  const result = await sts.getCallerIdentity({}).promise()
  return result.Account
}

export default memoize(getAccountId, ({ proj, stage }) => `${proj}/${stage}`)
