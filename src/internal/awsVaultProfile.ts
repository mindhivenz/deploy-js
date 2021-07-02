import {
  accessRoleSessionName,
  accessTargetRoleArn,
  resolveAccount,
} from './awsAccounts'

export interface IOptions {
  proj: string
  stage: string
  region: string
  roleName?: string
}

interface IResult {
  profileName: string
  header: string
  iniProfile: string
}

export const awsVaultProfile = async ({
  proj,
  stage,
  region,
  roleName,
}: IOptions): Promise<IResult> => {
  const profileName =
    stage === 'dev' ? stage : stage === 'production' ? proj : `${proj}-${stage}`
  const account = await resolveAccount({ proj, stage })
  const header = `[profile ${profileName}]`
  return {
    profileName,
    header,
    iniProfile: [
      header,
      'source_profile = mindhive-ops',
      `role_arn = ${accessTargetRoleArn(account.Id!, roleName)}`,
      `role_session_name = ${accessRoleSessionName(account)}`,
      `region = ${region}`,
    ].join('\n'),
  }
}
