import log from 'fancy-log'
import fs from 'fs'
import os from 'os'
import path from 'path'
import PluginError from 'plugin-error'
import {
  accessRoleSessionName,
  accessTargetRoleArn,
  resolveAccount,
} from './awsAccounts'
import { commandLine, highlight, toCopy } from './colors'

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

interface IOptions {
  proj: string
  stage: string
  region: string
}

export default ({ proj, stage, region }: IOptions) => async () => {
  const profileName = stage === 'dev' ? stage : `${proj}-${stage}`
  const profileHeader = `[profile ${profileName}]`
  const account = await resolveAccount({ proj, stage })
  const roleArn = accessTargetRoleArn(account.Id!)
  const iniProfile = [
    profileHeader,
    'source_profile = mindhive-ops',
    `role_arn = ${roleArn}`,
    `role_session_name = ${accessRoleSessionName(account)}`,
    `region = ${region}`,
  ].join('\n')
  const config = existingConfigContent()
  if (config.includes(profileHeader)) {
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
    `Profile created. Now you can: ${commandLine(
      `aws-vault exec ${profileName} -- ...`,
    )}`,
  )
}
