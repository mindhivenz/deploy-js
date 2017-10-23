import GulpRunner from 'gulp-run'

import publicStageName from './publicStageName'
import awsCredentialsEnv from './awsCredentialsEnv'


const serializeArgs = args =>
  Object.entries(args)
    .map(([k, v]) => `--${k} "${v}"`)
    .join(' ')

class ServerlessRunner extends GulpRunner {

  constructor({
    command,
    args = {},
    proj,
    stage,
    env = {},
    ...gulpRunOptions,
  }) {
    super(
      `serverless ${command} ${serializeArgs({ 
        stageLocal: stage, 
        stagePublic: publicStageName(stage), 
        ...args,
      })}`,
      {
        env: { ...process.env, ...env },  // Copy to not modify original
        verbosity: 2,
        ...gulpRunOptions,
      }
    )
    this.proj = proj
    this.stage = stage
  }

  async _transform(file, encoding, callback) {
    try {
      const env = await awsCredentialsEnv({ proj: this.proj, stage: this.stage })
      Object.assign(this.command.options.env, env)
      super._transform(file, encoding, callback)
    } catch (e) {
      callback(e)
    }
  }
}

export default (...args) => new ServerlessRunner(...args)
