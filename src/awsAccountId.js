import STS from 'aws-sdk/clients/sts'
import { proj as credentialsFactory } from './awsCredentials'

let resultPromise = null

export default async ({ proj, stage }) => {
  if (!resultPromise) {
    resultPromise = new Promise(async (resolve, reject) => {
      try {
        const credentials = credentialsFactory({ proj, stage })
        const sts = new STS({ credentials })
        const result = await sts.getCallerIdentity({}).promise()
        resolve(result.Account)
      } catch (e) {
        reject(e)
      }
    })
  }
  await resultPromise
}
