import awsAccountId from './awsAccountId'

interface IOptions {
  proj: string
  stage: string
  region: string
  name: string
}

export default async ({ proj, stage, region, name }: IOptions) => {
  const accountId = await awsAccountId({ proj, stage })
  return `${accountId}.dkr.ecr.${region}.amazonaws.com/${name}`
}
