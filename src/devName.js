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

export const requireDevNameSpecified = () => {
  yargs
    .describe('devName', "Developer's git user.name as kebab-case, can be retrieved with who-am-i task")
    .demandOption('devName')
}

export default () => {
  return yargs.argv.devName || gitUserName()
}
