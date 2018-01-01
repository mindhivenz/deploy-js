import fs from 'fs'
import os from 'os'
import path from 'path'
import PluginError from 'plugin-error'
import log from 'fancy-log'
import colors from 'ansi-colors'
import { accessTargetRoleArn, resolveAccount } from './awsAccounts'


const awsConfigFilePath = () => path.join(os.homedir(), '.aws', 'config')

const existingConfigContent = () => {
  const configPath = awsConfigFilePath()
  try {
    return fs.readFileSync(configPath, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new PluginError(
        'addAwsVaultProfile',
        `It appears you don't have any credentials setup. No existing aws config at: ${configPath}`,
        { showProperties: false },
      )
    } else {
      throw e
    }
  }
}

export default ({ proj, stage, region }) =>
  async () => {
    const profileName = `${proj}-${stage}`
    const profileHeader = `[profile ${profileName}]`
    const account = await resolveAccount({ proj, stage })
    const roleArn = accessTargetRoleArn(account.Id)
    const iniProfile = [
      profileHeader,
      'source_profile=mindhive-ops',
      `role_arn=${roleArn}`,
      `region=${region}`,
    ].join('\n')
    const config = existingConfigContent()
    if (config.includes(profileHeader)) {
      log([
        `You already have a profile called ${colors.yellow(profileName)}.`,
        "I wont't go changing your config. You can do it manually.",
        `This is what you need in ${colors.yellow(awsConfigFilePath())}:`,
        colors.green(iniProfile),
      ].join('\n'))
      return
    }
    const separator = config.endsWith('\n\n') ? '' : '\n'
    fs.appendFileSync(awsConfigFilePath(), `${separator}${iniProfile}\n`)
    log(`Profile created. Now you can: ${colors.blue(`aws-vault exec ${profileName} -- ...`)}`)
  }
