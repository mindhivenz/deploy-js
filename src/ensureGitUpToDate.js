import gutil from 'gulp-util'

import gitExec from './gitExec'

// Based off: https://stackoverflow.com/a/3278427/3424884

export default async (repoPath, pluginName = 'ensureGitUpToDate') => {
  const options = { cwd: repoPath }
  await gitExec('remote update', pluginName, options)
  const local = await gitExec('rev-parse @', pluginName, options)
  const remote = await gitExec('rev-parse @{u}', pluginName, options)
  const base = await gitExec('merge-base @ @{u}', pluginName, options)
  if (local === remote) {
    return 'Up to date'
  } else if (local === base) {
    throw new gutil.PluginError('ensureGitUpToDate', 'You are behind origin, need to pull')
  } else if (remote === base) {
    return 'Ahead of origin, need to push'
  } else {
    throw new gutil.PluginError('ensureGitUpToDate', 'You have diverged from origin')
  }
}
