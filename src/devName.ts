import colors from 'ansi-colors'
import once from 'lodash/once'
import PluginError from 'plugin-error'
import shell, { ExecOutputReturnValue } from 'shelljs'
import yargs from 'yargs'

const gitUserName = once(() => {
  const execResult = shell.exec('git config user.name', {
    silent: true,
  }) as ExecOutputReturnValue
  const name = execResult.stdout
    .trim()
    .toLowerCase()
    .replace(/\s+/, '-')
  if (!name) {
    throw new PluginError(
      '@mindhive/deploy/devName',
      `You need to set your git user name. Such as: ${colors.blue(
        'git config --global user.name "John Doe"',
      )}`,
    )
  }
  return name
})

export default (): string => (yargs.argv.devName as string) || gitUserName()
