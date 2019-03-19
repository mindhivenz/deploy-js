import yargs from 'yargs'
import execFile from './execFile'

export default async () => {
  const argv = yargs.argv
  const versionBump = ['major', 'minor', 'patch'].find(v => argv[v] === true)
  const versionBumpArgs = versionBump ? [`--${versionBump}`] : []
  await execFile('yarn', ['publish', '--non-interactive', ...versionBumpArgs], {
    pipeOutput: true,
  })
}
