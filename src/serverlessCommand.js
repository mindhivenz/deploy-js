import GulpRunner from 'gulp-run'

import publicStageName from './publicStageName'
import { proj as credentialsFactory } from './awsCredentials'


const serializeArgs = args => Object.entries(args)
  .map(([k, v]) => `--${k} "${v}"`)
  .join(' ')

class ServerlessRunner extends GulpRunner {

  constructor({
    command,
    args = {},
    proj,
    stage,
    ...gulpRunOptions,
  }) {
    super(
      `serverless ${command} ${serializeArgs({ stageLocal: stage, stagePublic: publicStageName(stage), ...args })}`,
      {
        env: { ...process.env },  // Copy to not modify original
        verbosity: 2,
        ...gulpRunOptions,
      }
    )
    this.proj = proj
    this.stage = stage
  }

  _transform(file, encoding, callback) {
    const credentials = credentialsFactory({ proj: this.proj, stage: this.stage })
    credentials.getPromise().then(
      () => {
        this.command.options.env.AWS_ACCESS_KEY_ID = credentials.accessKeyId
        this.command.options.env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey
        this.command.options.env.AWS_SESSION_TOKEN = credentials.sessionToken
        super._transform(file, encoding, callback)
      },
      callback,
    )
  }
}

export default (...args) => new ServerlessRunner(...args)
