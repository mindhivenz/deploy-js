import once from 'lodash/once'
import PluginError from 'plugin-error'
import shell, { ExecOutputReturnValue } from 'shelljs'
import camelCase from 'lodash/camelCase'
import { globalArgs, parseArgs } from './internal/args'
import { commandLine } from './colors'

const gitUserName = once(() => {
  if (process.env.CI) {
    return 'ci'
  }
  const execResult = shell.exec('git config user.name', {
    silent: true,
  }) as ExecOutputReturnValue
  const name = camelCase(execResult.stdout)
  if (!name) {
    throw new PluginError(
      '@mindhivenz/deploy/devName',
      `You need to set your git username. Such as: ${commandLine(
        'git config --global user.name "John Doe"',
      )}`,
    )
  }
  return name
})

export default (): string =>
  parseArgs(globalArgs, { complete: false }).devName || gitUserName()
