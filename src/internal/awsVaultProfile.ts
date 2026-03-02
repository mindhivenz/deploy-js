import { PRODUCTION, DEV_OWN_ACCOUNT_STAGE } from '../stages'
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
  let actualProfileName: string

  if (!profileName) {
    const profileNameParts =
      stage === DEV_OWN_ACCOUNT_STAGE
        ? [stage]
        : stage === PRODUCTION
        ? [proj]
        : [proj, stage]
    if (roleName) {
      profileNameParts.push(roleName)
    }
    actualProfileName = profileNameParts.join('-')
  } else {
    actualProfileName = profileName
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
