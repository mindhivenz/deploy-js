import awsAccountId from '../awsAccountId'

export interface IRepoHostOptions {
  proj: string
  region: string
  stage: string
}

export const repoHost = async (options: IRepoHostOptions) => {
  const overrideAccountId = process.env.ECR_ACCOUNT_ID
  const accountId = overrideAccountId || (await awsAccountId(options))
  return `${accountId}.dkr.ecr.${options.region}.amazonaws.com`
}
