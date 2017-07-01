import shell from 'shelljs'
import yargs from 'yargs'
import once from 'lodash/once'


const gitUserName = once(() =>  // Don't repeat
  shell.exec('git config user.name', { silent: true })
    .stdout
    .trim()
    .toLowerCase()
    .replace(/\s+/, '-')
)

export default () =>
  yargs.argv.devName || gitUserName()
