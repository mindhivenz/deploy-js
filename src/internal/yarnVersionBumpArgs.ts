import yargs from 'yargs'

export const yarnVersionBumpArgs = (): string[] => {
  const argv = yargs.argv
  const versionBump = ['major', 'minor', 'patch'].find(v => argv[v] === true)
  return versionBump ? [`--${versionBump}`] : []
}
