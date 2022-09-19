import { globalArgs, parseArgs } from './args'

const group = 'Version bump'

export const yarnVersionBumpArgs = (): string[] => {
  const argv = parseArgs(
    globalArgs
      .option('patch', {
        boolean: true,
        group,
      })
      .option('minor', {
        boolean: true,
        group,
      })
      .option('major', {
        boolean: true,
        group,
      })
      .option('same', {
        boolean: true,
        group,
      }),
    { complete: false },
  )
  const versionBumpOptions = ['same', 'major', 'minor', 'patch'] as const
  const versionBump = versionBumpOptions.find((v) => argv[v] === true) ?? 'same'
  if (versionBump === 'same') {
    return []
  }
  return [`--${versionBump}`]
}
