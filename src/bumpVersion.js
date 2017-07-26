import path from 'path'
import semver from 'semver'
import shell from 'shelljs'
import gutil from 'gulp-util'
import yargs from 'yargs'

import ensureGitUpToDate from './ensureGitUpToDate'
import readJson from './readJson'


const pluginName = '@mindhive/deploy/bumpVersion'

export default async (packageJsonPath) => {
  const release = yargs
    .option('version-bump', {
      describe: "semver.inc() option, for example: 'patch', 'minor', 'major', or 'same' to not change version",
      default: 'patch',
    })
    .argv['version-bump']
  const cwd = path.dirname(packageJsonPath)
  await ensureGitUpToDate(cwd, pluginName)
  const pkg = readJson(packageJsonPath, pluginName)
  const currentVersion = pkg.version
  if (release === 'same') {
    return currentVersion
  }
  const newVersion = semver.inc(currentVersion, release)
  const bumpResult = shell.exec(
    `yarn version --new-version ${newVersion}`,
    { cwd, silent: true },
  )
  if (bumpResult.code !== 0) {
    throw new gutil.PluginError(pluginName, bumpResult.stderr)
  }
  return newVersion
}
