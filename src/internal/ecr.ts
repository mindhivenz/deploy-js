import AWS from 'aws-sdk'
import memoize from 'lodash/memoize'
import awsServiceOptions from '../awsServiceOptions'

export interface IOptions {
  proj: string
  region: string
  stage: string
}

const buildArgs = async (options: IOptions): Promise<string[]> => {
  const ecr = new AWS.ECR(awsServiceOptions(options))
  const result = await ecr.getAuthorizationToken().promise()
  const [authData] = result.authorizationData || [null]
  if (!authData || !authData.authorizationToken) {
    throw new Error('No authorizationData data')
  }
  const authPair = Buffer.from(authData.authorizationToken, 'base64').toString(
    'ascii',
  )
  const [username, password] = authPair.split(':')
  return ['login', '-u', username, '-p', password, authData.proxyEndpoint!]
}

export const dockerLoginArgs = memoize(
  buildArgs,
  ({ proj, stage, region }: IOptions) => `${proj}/${stage}/${region}`,
) as typeof buildArgs
