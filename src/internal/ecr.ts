import awsAccountId from '../awsAccountId'

export interface IRepoHostOptions {
  proj: string
  region: string
  stage: string
  overrideAccountId?: string
}

export const repoHost = async (options: IRepoHostOptions) => {
  const accountId = options.overrideAccountId || (await awsAccountId(options))
  return `${accountId}.dkr.ecr.${options.region}.amazonaws.com`
}
