import path from 'path'
import semver from 'semver'
import shell from 'shelljs'
import gutil from 'gulp-util'

import ensureGitUpToDate from './ensureGitUpToDate'
import readJson from './readJson'


const pluginName = '@mindhive/deploy/bumpVersion'

export default async (packageJsonPath, release = 'patch') => {
  const cwd = path.dirname(packageJsonPath)
  await ensureGitUpToDate(cwd, pluginName)
  const pkg = readJson(packageJsonPath, pluginName)
  const newVersion = semver.inc(pkg.version, release)
  const bumpResult = shell.exec(
    `yarn version --new-version ${newVersion}`,
    { cwd, silent: true },
  )
  if (bumpResult.code !== 0) {
    throw new gutil.PluginError(pluginName, bumpResult.stderr)
  }
  return newVersion
}
