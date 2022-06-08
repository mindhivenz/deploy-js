import { globalArgs } from './args'

const group = 'Version bump'

export const yarnVersionBumpArgs = async (): Promise<string[]> => {
  const argv = await globalArgs
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
  const versionBumpOptions = ['same', 'major', 'minor', 'patch'] as const
  const versionBump = versionBumpOptions.find((v) => argv[v] === true)
  return versionBump && versionBump !== 'same' ? [`--${versionBump}`] : []
}
