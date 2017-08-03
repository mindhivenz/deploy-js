import shell from 'shelljs'
import yargs from 'yargs'
import once from 'lodash/once'
import gutil from 'gulp-util'


const gitUserName = once(() => {
  const name = shell.exec('git config user.name', { silent: true })
    .stdout
    .trim()
    .toLowerCase()
    .replace(/\s+/, '-')
  if (! name) {
    throw new gutil.PluginError(
      '@mindhive/deploy/devName',
      `You need to set your git user name. Such as: ${gutil.colors.blue('git config --global user.name "John Doe"')}`,
    )
  }
  return name
})

export default () =>
  yargs.argv.devName || gitUserName()
