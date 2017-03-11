import path from 'path'
import semver from 'semver'
import shell from 'shelljs'
import gutil from 'gulp-util'

import ensureGitUpToDate from './ensureGitUpToDate'
import readJson from './readJson'
import gitExec from './gitExec'


const pluginName = 'bumpVersion'

export default async (packageJsonPath, release = 'patch') => {
  await ensureGitUpToDate(path.dirname(packageJsonPath), pluginName)
  const pkg = readJson(packageJsonPath, pluginName)
  const newVersion = semver.inc(pkg.version, release)
  const bumpResult = shell.exec(
    `yarn version --new-version ${newVersion}`,
    {
      cwd: path.dirname(packageJsonPath),
      silent: true,
    },
  )
  if (bumpResult.code !== 0) {
    throw new gutil.PluginError(pluginName, bumpResult.stderr)
  }
  await gitExec('push', pluginName)
  return newVersion
}
