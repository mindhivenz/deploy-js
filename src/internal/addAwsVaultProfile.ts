import log from 'fancy-log'
import fs from 'fs'
import os from 'os'
import path from 'path'
import PluginError from 'plugin-error'
import { commandLine, highlight, toCopy } from '../colors'
import { awsVaultProfile, IOptions } from './awsVaultProfile'

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

export default (options: IOptions) => async () => {
  const { profileName, header, iniProfile } = await awsVaultProfile(options)
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
