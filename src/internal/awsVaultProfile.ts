import {
  accessRoleSessionName,
  accessTargetRoleArn,
  resolveAccount,
} from './awsAccounts'

const mindhiveOpsAwsProfileName = `mindhive-ops`

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
  devName?: string
}

export const awsVaultProfile = async ({
  proj,
  stage,
  region,
  roleName,
  devName,
}: IOptions): Promise<IResult> => {
  const profileNameParts =
    stage === 'dev' ? [stage] : stage === 'production' ? [proj] : [proj, stage]
  if (roleName) {
    profileNameParts.push(roleName)
  }
  const profileName = profileNameParts.join('-')
  const header = `[profile ${profileName}]`
  const account = await resolveAccount({ proj, stage, devName })
  const iniProfile = [
    header,
    `source_profile = ${mindhiveOpsAwsProfileName}`,
    `role_arn = ${accessTargetRoleArn(account.Id!, roleName)}`,
    `role_session_name = ${accessRoleSessionName({
      accountName: account.Name!,
      devName,
      roleName,
    })}`,
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
