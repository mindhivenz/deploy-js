import { globalArgs } from './args'

const group = 'Version bump'

export const yarnVersionBumpArgs = (): string[] => {
  const argv = globalArgs
    .option('patch', {
      boolean: true,
      default: true,
      group,
    })
    .option('minor', {
      boolean: true,
      group,
    })
    .option('major', {
      boolean: true,
      conflicts: ['minor'],
      group,
    })
    .option('same', {
      boolean: true,
      conflicts: ['minor', 'major'],
      group,
    }).argv
  const versionBump = ['same', 'major', 'minor', 'patch'].find(
    (v) => argv[v] === true,
  )
  return versionBump && versionBump !== 'same' ? [`--${versionBump}`] : []
}
