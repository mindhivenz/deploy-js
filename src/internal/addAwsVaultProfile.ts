import log from 'fancy-log'
import fs from 'fs'
import os from 'os'
import path from 'path'
import PluginError from 'plugin-error'
import { commandLine, highlight, toCopy } from '../colors'
import { resolveAccount } from './awsAccounts'
import { awsVaultProfile } from './awsVaultProfile'

const awsConfigFilePath = () => path.join(os.homedir(), '.aws', 'config')

const existingConfigContent = () => {
  const configPath = awsConfigFilePath()
  try {
    return fs.readFileSync(configPath, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new PluginError(
        'addAwsVaultProfile',
        `It appears you don't have AWS credentials setup. No existing aws config at: ${configPath}`,
        { showProperties: false },
      )
    } else {
      throw e
    }
  }
}

export interface IOptions {
  proj: string
  stage: string
  region: string
  roleName?: string
}

export default (options: IOptions) => async () => {
  const account = await resolveAccount(options)
  const { profileName, header, iniProfile } = awsVaultProfile({
    ...options,
    accountId: account.Id!,
    accountName: account.Name!,
  })
  const config = existingConfigContent()
  if (config.includes(header)) {
    log(
      [
        `You already have a profile called ${highlight(profileName)}.`,
        "I won't go changing your config. You can do it manually.",
        `This is what you need in ${highlight(awsConfigFilePath())}:`,
        toCopy(iniProfile),
      ].join('\n'),
    )
    return
  }
  const separator = config.endsWith('\n\n') ? '' : '\n'
  fs.appendFileSync(awsConfigFilePath(), `${separator}${iniProfile}\n`)
  log(
    [
      `Profile created. Now you can: ${commandLine(
        `aws-vault exec ${profileName} -- ...`,
      )}`,
      `Note: if you are restricted to a certain role you need to change the role name in ${highlight(
        awsConfigFilePath(),
      )}`,
    ].join('\n'),
  )
}
