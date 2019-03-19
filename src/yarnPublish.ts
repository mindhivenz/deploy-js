import yargs from 'yargs'
import execFile from './execFile'

interface IOptions {
  pipeOutput?: boolean
  cwd?: string
}

export default async ({ pipeOutput = true, ...options }: IOptions = {}) => {
  const argv = yargs.argv
  const versionBump = ['major', 'minor', 'patch'].find(v => argv[v] === true)
  const versionBumpArgs = versionBump ? [`--${versionBump}`] : []
  await execFile('yarn', ['publish', '--non-interactive', ...versionBumpArgs], {
    pipeOutput,
    ...options,
  })
}
