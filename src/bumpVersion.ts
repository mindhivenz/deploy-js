import log from 'fancy-log'
import path from 'path'
import PluginError from 'plugin-error'
import memoize from 'lodash/memoize'

import ensureGitUpToDate from './ensureGitUpToDate'
import execFile from './execFile'
import { highlight } from './colors'
import { yarnVersionBumpArgs } from './internal/yarnVersionBumpArgs'
import readJson from './readJson'

const pluginName = '@mindhive/deploy/bumpVersion'

interface IOptions {
  gitTag?: boolean
  gitUpToDate?: boolean
}

const defaultPackagePath = './package.json'

const bumpVersion = async (
  packageJsonPath: string = defaultPackagePath,
  { gitTag = true, gitUpToDate = true }: IOptions = {},
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

  const repoPath = path.dirname(packageJsonPath)
  if (gitUpToDate) {
    await ensureGitUpToDate(repoPath, { pluginName })
  }
  const yarnArgs = await yarnVersionBumpArgs()
  const sameVersion = !yarnArgs.length
  if (sameVersion) {
    return readPackageVersion()
  }
  if (!gitTag) {
    yarnArgs.push('--no-git-tag-version')
  }
  await execFile('yarn', ['version', ...yarnArgs], {
    cwd: repoPath,
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
