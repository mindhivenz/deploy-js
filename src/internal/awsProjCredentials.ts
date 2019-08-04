import STS from 'aws-sdk/clients/sts'
import AWS from 'aws-sdk/global'
import memoize from 'lodash/memoize'

import devName from '../devName'
import { accessTargetRoleArn, resolveAccount } from './awsAccounts'
import './awsConfig'
import { master } from './awsMasterCredentials'
import { MAX_SESSION_SECONDS } from './awsSession'

export interface IOptions {
  proj: string
  stage: string
  fullDurationSession?: boolean
}

const accentuateAccountName = (name: string) => {
  if (name.includes('production')) {
    return name.toLocaleUpperCase()
  }
  return name
}

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
      params.DurationSeconds = MAX_SESSION_SECONDS
    }
  }
}

export const projCredentialsFactory = memoize(
  (options: IOptions) => new ProjCredentials(options),
  ({ fullDurationSession = false, proj, stage }: IOptions) =>
    `${proj}/${stage}/${fullDurationSession}`,
)
