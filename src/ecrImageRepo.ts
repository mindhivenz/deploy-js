import awsAccountId from './awsAccountId'

interface IOptions {
  proj: string
  stage: string
  region: string
  imageName: string
}

export default async ({ proj, stage, region, imageName }: IOptions) => {
  const accountId = await awsAccountId({ proj, stage })
  return `${accountId}.dkr.ecr.${region}.amazonaws.com/${imageName}`
}
