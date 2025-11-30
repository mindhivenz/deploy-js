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
  roleName: string
  devName?: string
  profileName?: string
}

export const awsVaultProfile = async ({
  proj,
  stage,
  region,
  roleName,
  devName,
  profileName,
}: IOptions): Promise<IResult> => {

  let actualProfileName = profileName

  if(!profileName){
    const profileNameParts =
      stage === 'dev' ? [stage] : stage === 'production' ? [proj] : [proj, stage]
    if (roleName) {
      profileNameParts.push(roleName)
    }
    actualProfileName = profileNameParts.join('-')
  }
  
  const header = `[profile ${actualProfileName}]`
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
    profileName: actualProfileName,
    header,
    iniProfile: iniProfile.join('\n'),
  }
}
