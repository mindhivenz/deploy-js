import { globalArgs } from './args'

export const yarnVersionBumpArgs = (): string[] => {
  const argv = globalArgs.argv
  const versionBump = ['major', 'minor', 'patch'].find(v => argv[v] === true)
  return versionBump ? [`--${versionBump}`] : []
}
