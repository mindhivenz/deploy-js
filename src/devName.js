import shell from 'shelljs'
import yargs from 'yargs'
import once from 'lodash/once'


const describeDevName = () => {
  yargs.describe('devName', "Developer's git user.name as kebab-case, can be retrieved with who-am-i task")
}

export const requireDevNameSpecified = () => {
  describeDevName()
  yargs.demandOption(['devName'])
}

export default once(() => {  // Use once to ensure it's immutable
  describeDevName()
  const specifiedDevName = yargs.argv.devName
  if (specifiedDevName) {
    return specifiedDevName
  }
  return shell.exec('git config user.name', { silent: true })
    .stdout
    .trim()
    .toLowerCase()
    .replace(/\s+/, '-')
})
