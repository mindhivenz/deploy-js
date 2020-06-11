import log from 'fancy-log'
import path from 'path'
import PluginError from 'plugin-error'
import memoize from 'lodash/memoize'

import ensureGitUpToDate from './ensureGitUpToDate'
import execFile from './execFile'
import { highlight } from './internal/colors'
import { yarnVersionBumpArgs } from './internal/yarnVersionBumpArgs'
import readJson from './readJson'

const pluginName = '@mindhive/deploy/bumpVersion'

interface IOptions {
  gitTag: boolean
}

const defaultPackagePath = './package.json'

const bumpVersion = async (
  packageJsonPath: string = defaultPackagePath,
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

  const cwd = path.dirname(packageJsonPath)
  await ensureGitUpToDate(cwd, { pluginName })
  const yarnArgs = yarnVersionBumpArgs()
  const sameVersion = !yarnArgs.length
  if (sameVersion) {
    return readPackageVersion()
  }
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

// If multiple tasks call this only bump once
export default memoize(
  bumpVersion,
  (packageJsonPath: string = defaultPackagePath) =>
    path.normalize(path.resolve(packageJsonPath)),
)
