import colors from 'ansi-colors'
import log from 'fancy-log'
import path from 'path'
import PluginError from 'plugin-error'
import shell, { ExecOutputReturnValue } from 'shelljs'
import yargs from 'yargs'

import ensureGitUpToDate from './ensureGitUpToDate'
import readJson from './readJson'

const pluginName = '@mindhive/deploy/bumpVersion'

export default async (packageJsonPath: string = './package.json') => {
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

  const versionBump = yargs.option('version-bump', {
    default: 'patch',
    describe:
      "'patch', 'minor', 'major', a literal version number, or 'same' to not change version",
  }).argv['version-bump']
  const cwd = path.dirname(packageJsonPath)
  await ensureGitUpToDate(cwd, { pluginName })
  const currentVersion = readPackageVersion()
  if (versionBump === 'same') {
    return currentVersion
  }
  const yarnArgs = ['major', 'minor', 'patch'].includes(versionBump)
    ? `--${versionBump}`
    : `--new-version ${versionBump}`
  const bumpResult = shell.exec(`yarn version ${yarnArgs}`, {
    cwd,
    silent: true,
  }) as ExecOutputReturnValue
  if (bumpResult.code !== 0) {
    throw new PluginError(pluginName, bumpResult.stderr)
  }
  const newVersion = readPackageVersion()
  log(`Version bumped to: ${colors.yellow(newVersion)}`)
  return newVersion
}
