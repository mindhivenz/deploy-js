import shell from 'shelljs'
import yargs from 'yargs'


export default () => {
  const specifiedDevName = yargs
    .describe('devName', "Developer's git user.name as kebab-case, can be retrieved with who-am-i task")
    .argv
    .devName
  if (specifiedDevName) {
    return specifiedDevName
  }
  return shell.exec('git config user.name', { silent: true })
    .stdout
    .trim()
    .toLowerCase()
    .replace(/\s+/, '-')
}
