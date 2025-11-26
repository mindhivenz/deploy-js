import AWS from 'aws-sdk'
import log from 'fancy-log'
import memoize from 'lodash/memoize'
import { commandLine, highlight } from '../colors'
import {
  accessRoleSessionName,
  accessTargetRoleArn,
  accessTargetRoleName,
  resolveAccount,
} from './awsAccounts'
import './awsConfig'
import { master, masterIsRole } from './awsMasterCredentials'
import { IProjOptions } from '../awsProjOptions'
import {
  MAX_CHAINED_ROLE_SESSION_SECONDS,
  MAX_SESSION_SECONDS,
} from './awsSession'
import { IUserOptions } from '../awsUserOptions'

export class ProjCredentials extends AWS.ChainableTemporaryCredentials {
  constructor(private readonly projOptions: IProjOptions) {
    super({ masterCredentials: master, stsConfig: {} })
  }

  private _getUserRole(): string {
    const role = process.env.MHD_ROLE ?? accessTargetRoleName
    return role
  }

  public refresh(callback: (err: AWS.AWSError) => void): void {
    this._resolveRoleArn().then(
      () => {
        super.refresh(callback)
      },
      (err) => {
        callback?.(err)
      },
    )
  }

  private async _resolveRoleArn() {
    const params = this.service.config.params as AWS.STS.Types.AssumeRoleRequest
    if (params.RoleArn) {
      return
    }
    const account = await resolveAccount(this.projOptions)
    params.RoleArn = accessTargetRoleArn(account.Id!, this._getUserRole()) // TODO This defaults to Ops role, we need to change to take a user specific default role. Can't pull from cloud-master as that would be cyclic
    params.RoleSessionName = accessRoleSessionName({
      accountName: account.Name!,
    })
    if (this.projOptions.fullDurationSession) {
      const chainedRoles = await masterIsRole()
      if (chainedRoles) {
        log(
          `${highlight(
            "Can't use full duration session",
          )} as your master credentials are a role/session. AWS limits chained roles to 1 hour sessions, using that instead.`,
        )
        if ('AWS_VAULT' in process.env) {
          log(`Use: ${commandLine('aws-vault exec --no-session ...')}`)
        }
        params.DurationSeconds = MAX_CHAINED_ROLE_SESSION_SECONDS
      } else {
        params.DurationSeconds = MAX_SESSION_SECONDS
      }
    }
  }
}

const credentialsFactory = (options: IProjOptions): AWS.Credentials =>
  process.env.CI
    ? new AWS.EnvironmentCredentials('AWS')
    : process.env.EC2_PROJ_CREDENTIALS
    ? new AWS.EC2MetadataCredentials()
    : process.env.SSM_PROJ_CREDENTIALS
    ? new AWS.SharedIniFileCredentials()
    : new ProjCredentials(projPptions, userOptions)

export const projCredentialsFactory = memoize(
  credentialsFactory,
  ({ fullDurationSession = false, proj, stage }: IProjOptions) =>
    `${proj}/${stage}/${fullDurationSession}`,
) as typeof credentialsFactory
