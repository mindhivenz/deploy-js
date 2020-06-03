import log from 'fancy-log'
import path from 'path'
import PluginError from 'plugin-error'

import ensureGitUpToDate from './ensureGitUpToDate'
import execFile from './execFile'
import { globalArgs } from './internal/args'
import { highlight } from './internal/colors'
import readJson from './readJson'

const pluginName = '@mindhive/deploy/bumpVersion'
const group = 'Version bump'

interface IOptions {
  gitTag: boolean
}

export default async (
  packageJsonPath: string = './package.json',
  { gitTag }: IOptions = { gitTag: true },
) => {
  const readPackageVersion = (): string => {
    try {
      const pkg = readJson(packageJsonPath, { pluginName })
      return pkg.version
    } catch (e) {
      throw new PluginError(
        pluginName,
        `Failed to read ${packageJsonPath}: ${e}`,
      )
    }
  }

  const args = globalArgs
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
  const cwd = path.dirname(packageJsonPath)
  await ensureGitUpToDate(cwd, { pluginName })
  if (args.same) {
    return readPackageVersion()
  }
  const yarnArgs = [args.major ? '--major' : args.minor ? '--minor' : '--patch']
  if (!gitTag) {
    yarnArgs.push('--no-git-tag-version')
  }
  await execFile('yarn', ['version', ...yarnArgs], {
    cwd,
  })
  const newVersion = readPackageVersion()
  log(`Version bumped to: ${highlight(newVersion)}`)
  return newVersion
}
