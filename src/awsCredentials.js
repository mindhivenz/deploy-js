import AWS from 'aws-sdk/global'
import memoize from 'lodash/memoize'
import gutil from 'gulp-util'

import devName from './devName'
import { resolve, accessRoleArn } from './awsAccounts'


// Force credentials to come from the env so they are not being stored unencrypted in the standard ini file
export const master = new AWS.EnvironmentCredentials('AWS')

const pluginName = '@mindhive/deploy/awsCredentials'

class ProjCredentials extends AWS.TemporaryCredentials {

  constructor({ proj, stage }) {
    super(
      { credentials: master },
      master,
    )
    this.proj = proj
    this.stage = stage
  }

  refresh(callback) {
    const defaultedCallback = callback || ((err) => { if (err) throw err })  // This default matches what TemporaryCredentials
    const successCallback = () => {
      if (! this.accessKeyId) {
        defaultedCallback(new gutil.PluginError(
          pluginName,
          `Could not assume role into project, needed?: grant:ops-user:access:${this.stage} --devName ${devName()}`,
        ))
      }
      defaultedCallback()
    }
    this._resolveRoleArn().then(
      () => super.refresh(successCallback),
      defaultedCallback,
    )
  }

  async _resolveRoleArn() {
    if (this.params.RoleArn) {
      return
    }
    this.account = await resolve({ proj: this.proj, stage: this.stage })
    this.params.RoleArn = accessRoleArn(this.account)
    this.params.RoleSessionName = `${devName()}@${this.account.Name}`
  }
}

export const proj = memoize(
  options => new ProjCredentials(options),
  ({ proj: passedProj, stage }) => `${passedProj}/${stage}`,
)
