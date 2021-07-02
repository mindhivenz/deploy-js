import {
  accessRoleSessionName,
  accessTargetRoleArn,
  resolveAccount,
} from './awsAccounts'

interface IResult {
  profileName: string
  header: string
  iniProfile: string
}

export interface IOptions {
  proj: string
  stage: string
  region?: string
  roleName?: string
}

export const awsVaultProfile = async ({
  proj,
  stage,
  region,
  roleName,
}: IOptions): Promise<IResult> => {
  const profileNameParts =
    stage === 'dev' ? [stage] : stage === 'production' ? [proj] : [proj, stage]
  if (roleName) {
    profileNameParts.push(roleName)
  }
  const profileName = profileNameParts.join('-')
  const header = `[profile ${profileName}]`
  const account = await resolveAccount({ proj, stage })
  const iniProfile = [
    header,
    'source_profile = mindhive-ops',
    `role_arn = ${accessTargetRoleArn(account.Id!, roleName)}`,
    `role_session_name = ${accessRoleSessionName(account.Name!)}`,
  ]
  if (region) {
    iniProfile.push(`region = ${region}`)
  }
  return {
    profileName,
    header,
    iniProfile: iniProfile.join('\n'),
  }
}
