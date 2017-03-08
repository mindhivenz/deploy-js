import shell from 'shelljs'


export default () => {
  const result = shell.exec('git config user.name', { timeout: 1000, silent: true })
  if (result.code !== 0) {
    throw new Error('Failed to execute git')
  }
  return result
    .stdout
    .replace('\n', '')
    .toLowerCase()
}
