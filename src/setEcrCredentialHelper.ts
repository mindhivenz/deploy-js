import log from 'fancy-log'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import PluginError from 'plugin-error'
import execFile from './execFile'

import { IOptions, repoHost } from './internal/ecr'

export default async (options: IOptions) => {
  try {
    await execFile('docker-credential-ecr-login', ['-v'])
  } catch (e) {
    throw new PluginError(
      'setEcrCredentialHelper',
      'You need to install https://github.com/awslabs/amazon-ecr-credential-helper',
    )
  }
  const host = await repoHost(options)
  const configPath = path.join(os.homedir(), '.docker', 'config.json')
  let originalRaw: string | null = null
  try {
    originalRaw = (await fs.readFile(configPath, {
      encoding: 'UTF-8',
    })) as string
  } catch (e) {
    log.info(`No existing ${configPath}, will create one...`)
  }
  let config: any
  const CRED_HELPER = 'ecr-login'
  if (originalRaw) {
    config = JSON.parse(originalRaw)
    const currentHelper = config.credHelpers?.[host]
    if (currentHelper === CRED_HELPER) {
      return
    } else if (currentHelper) {
      throw new PluginError(
        'setEcrCredentialHelper',
        `Unexpected existing credHelpers.${host}: ${currentHelper}, wanted: ${CRED_HELPER}`,
      )
    }
  } else {
    config = {}
  }
  if (!config.credHelpers) {
    config.credHelpers = {}
  }
  config.credHelpers[host] = CRED_HELPER
  await fs.writeFile(configPath, JSON.stringify(config, null, '\t'), {
    encoding: 'UTF-8',
    mode: 0o600,
  })
}
