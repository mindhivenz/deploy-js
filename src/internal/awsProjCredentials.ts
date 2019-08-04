import STS from 'aws-sdk/clients/sts'
import AWS from 'aws-sdk/global'
import memoize from 'lodash/memoize'

import devName from '../devName'
import { accessTargetRoleArn, resolveAccount } from './awsAccounts'
import './awsConfig'
import { master } from './awsMasterCredentials'

export interface IOptions {
  proj: string
  stage: string
  fullDurationSession?: boolean
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
    console.log(this.service) // tslint:disable-line
    const params = this.service.config.params as STS.Types.AssumeRoleRequest
    if (params.RoleArn) {
      return
    }
    const account = await resolveAccount(this.projOptions)
    params.RoleArn = accessTargetRoleArn(account.Id!)
    params.RoleSessionName = `${account.Name}/${devName()}`
    /* TODO: requires MaxSessionDuration set on Role. Make specific Ops role in accounts.
    if (this.projOptions.fullDurationSession) {
      params.DurationSeconds = 12 * 60 * 60
    }
*/
  }
}

export const projCredentialsFactory = memoize(
  (options: IOptions) => new ProjCredentials(options),
  ({ fullDurationSession = false, proj, stage }: IOptions) =>
    `${proj}/${stage}/${fullDurationSession}`,
)
