import shell from 'shelljs'


export default () =>
  shell.exec('git config user.name', { timeout: 1000 })
    .stdout
    .replace('\n', '')
    .toLowerCase()
