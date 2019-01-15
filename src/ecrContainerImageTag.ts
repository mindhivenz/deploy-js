import awsAccountId from './awsAccountId'

interface IOptions {
  proj: string
  stage: string
  region: string
  tag: string
}

export default async ({ proj, stage, region, tag }: IOptions) => {
  const accountId = await awsAccountId({ proj, stage })
  return `${accountId}.dkr.ecr.${region}.amazonaws.com/${tag}`
}
