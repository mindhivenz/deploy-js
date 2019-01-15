import AWS from 'aws-sdk/global'
import memoize from 'lodash/memoize'

import devName from '../devName'
import { accessTargetRoleArn, resolveAccount } from './awsAccounts'

// Force credentials to come from the env so they are not being stored unencrypted in the standard ini file
export const master = new AWS.EnvironmentCredentials('AWS')

export interface IOptions {
  proj: string
  stage: string
}

class ProjCredentials extends AWS.TemporaryCredentials {
  constructor(private readonly options: IOptions) {
    super({}, master)
  }

  public refresh(callback: (err: AWS.AWSError) => void): void {
    const defaultedCallback =
      callback ||
      (err => {
        if (err) {
          throw err
        }
      }) // This default matches TemporaryCredentials
    this._resolveRoleArn().then(
      () =>
        super.refresh(() => {
          defaultedCallback(
            // @ts-ignore
            this.accessKeyId
              ? undefined
              : new Error(
                  'Could not assume role into project, have you been granted access?'
                ),
          )
        }),
      defaultedCallback,
    )
  }

  private async _resolveRoleArn() {
    // @ts-ignore
    const params = this.params
    if (params.RoleArn) {
      return
    }
    const account = await resolveAccount(this.options)
    params.RoleArn = accessTargetRoleArn(account.Id!)
    params.RoleSessionName = `${devName()}@${account.Name}`
  }
}

export const projCredentialsFactory = memoize(
  options => new ProjCredentials(options) as AWS.TemporaryCredentials,
  ({ proj: passedProj, stage }) => `${passedProj}/${stage}`,
)
