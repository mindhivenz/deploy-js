import once from 'lodash/once'
import PluginError from 'plugin-error'
import shell, { ExecOutputReturnValue } from 'shelljs'
import { globalArgs } from './internal/args'
import { commandLine } from './internal/colors'

const gitUserName = once(() => {
  const execResult = shell.exec('git config user.name', {
    silent: true,
  }) as ExecOutputReturnValue
  const name = execResult.stdout.trim().toLowerCase().replace(/\s+/, '-')
  if (!name) {
    if (process.env.CI) {
      return 'ci'
    }
    throw new PluginError(
      '@mindhive/deploy/devName',
      `You need to set your git user name. Such as: ${commandLine(
        'git config --global user.name "John Doe"',
      )}`,
    )
  }
  return name
})

export default (): string =>
  (globalArgs.argv.devName as string) || gitUserName()
