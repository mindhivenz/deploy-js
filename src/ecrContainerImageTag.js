import awsAccountId from './awsAccountId'

export default async ({ proj, stage, region, containerTag }) => {
  const accountId = await awsAccountId({ proj, stage })
  return `${accountId}.dkr.ecr.${region}.amazonaws.com/${containerTag}`
}
