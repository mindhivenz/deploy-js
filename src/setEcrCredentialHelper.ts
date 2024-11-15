import log from 'fancy-log'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import PluginError from 'plugin-error'
import execFile from './execFile'

import { IRepoHostOptions, repoHost } from './internal/ecr'

const CRED_HELPER = 'ecr-login'

const checkCredentialHelperInstalled = async () => {
  try {
    await execFile(`docker-credential-${CRED_HELPER}`, ['-v'])
  } catch (e) {
    throw new PluginError(
      'setEcrCredentialHelper',
      'You need to install https://github.com/awslabs/amazon-ecr-credential-helper',
    )
  }
}

export default async (options: IRepoHostOptions) => {
  const host = await repoHost(options)
  const configPath = path.join(os.homedir(), '.docker', 'config.json')
  let originalRaw: string | null = null
  try {
    originalRaw = (await fs.readFile(configPath, {
      encoding: 'utf-8',
    })) as string
  } catch (e) {
    log.info(`No existing ${configPath}, will create one...`)
  }
  let config: any
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
  await checkCredentialHelperInstalled()
  if (!config.credHelpers) {
    config.credHelpers = {}
  }
  config.credHelpers[host] = CRED_HELPER
  await fs.writeFile(configPath, JSON.stringify(config, null, '\t'), {
    encoding: 'utf-8',
    mode: 0o600,
  })
}
