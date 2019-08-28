import colors from 'ansi-colors'
import STS from 'aws-sdk/clients/sts'
import AWS from 'aws-sdk/global'
import log from 'fancy-log'
import memoize from 'lodash/memoize'
import devName from '../devName'
import { accessTargetRoleArn, resolveAccount } from './awsAccounts'
import './awsConfig'
import { master, masterIsRole } from './awsMasterCredentials'
import {
  MAX_CHAINED_ROLE_SESSION_SECONDS,
  MAX_SESSION_SECONDS,
} from './awsSession'

export interface IOptions {
  proj: string
  stage: string
  fullDurationSession?: boolean
}

const accentuateAccountName = (name: string) =>
  name.replace('production', 'PRODUCTION')

export class ProjCredentials extends AWS.ChainableTemporaryCredentials {
  constructor(private readonly projOptions: IOptions) {
    super({}, master)
  }

  public refresh(callback: (err: AWS.AWSError) => void): void {
    this._resolveRoleArn().then(
      () => {
        super.refresh(callback)
      },
      err => {
        if (callback) {
          callback(err)
        }
      },
    )
  }

  private async _resolveRoleArn() {
    const params = this.service.config.params as STS.Types.AssumeRoleRequest
    if (params.RoleArn) {
      return
    }
    const account = await resolveAccount(this.projOptions)
    params.RoleArn = accessTargetRoleArn(account.Id!)
    const accountName = accentuateAccountName(account.Name!)
    params.RoleSessionName = `${accountName}-${devName()}`
    if (this.projOptions.fullDurationSession) {
      const chainedRoles = await masterIsRole()
      if (chainedRoles) {
        log(
          colors.yellow(
            "Can't use as 12 hour session as your master credentials are a role. " +
              'AWS limits chained roles to sessions max of 1 hour, using that instead.',
          ),
        )
        if ('AWS_VAULT' in process.env) {
          log(`Use: ${colors.blue('aws-vault exec --no-session ...')}`)
        }
        params.DurationSeconds = MAX_CHAINED_ROLE_SESSION_SECONDS
      } else {
        params.DurationSeconds = MAX_SESSION_SECONDS
      }
    }
  }
}

export const projCredentialsFactory = memoize(
  (options: IOptions) => new ProjCredentials(options),
  ({ fullDurationSession = false, proj, stage }: IOptions) =>
    `${proj}/${stage}/${fullDurationSession}`,
)
