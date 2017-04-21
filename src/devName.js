import shell from 'shelljs'


export default () =>
  shell.exec('git config user.name', { silent: true })
    .stdout
    .trim()
