import { accessRoleSessionName, accessTargetRoleArn } from './awsAccounts'

interface IOptions {
  proj: string
  stage: string
  region: string
  accountId: string
  accountName: string
  roleName?: string
}

interface IResult {
  profileName: string
  header: string
  iniProfile: string
}

export const awsVaultProfile = ({
  proj,
  stage,
  region,
  accountId,
  accountName,
  roleName,
}: IOptions): IResult => {
  const profileName =
    stage === 'dev' ? stage : stage === 'production' ? proj : `${proj}-${stage}`
  const header = `[profile ${profileName}]`
  return {
    profileName,
    header,
    iniProfile: [
      header,
      'source_profile = mindhive-ops',
      `role_arn = ${accessTargetRoleArn(accountId, roleName)}`,
      `role_session_name = ${accessRoleSessionName(accountName)}`,
      `region = ${region}`,
    ].join('\n'),
  }
}
