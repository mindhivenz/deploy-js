import STS from 'aws-sdk/clients/sts'
import { proj as credentialsFactory } from './awsCredentials'
import memoize from 'lodash/memoize'

const getAccountId = async ({ proj, stage }) => {
  const credentials = credentialsFactory({ proj, stage })
  const sts = new STS({ credentials })
  const result = await sts.getCallerIdentity({}).promise()
  return result.Account
}

export default memoize(getAccountId, ({ proj, stage }) => `${proj}/${stage}`)
