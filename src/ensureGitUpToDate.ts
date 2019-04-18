import PluginError from 'plugin-error'

import { gitExec } from './internal/git'

// Based off: https://stackoverflow.com/a/3278427/3424884

interface IOptions {
  pluginName?: string
}

export default async (
  repoPath: string,
  { pluginName = '@mindhive/deploy/ensureGitUpToDate' }: IOptions = {},
) => {
  const options = { cwd: repoPath }
  try {
    await gitExec('diff-index HEAD --quiet --exit-code', pluginName, options)
  } catch (e) {
    throw new PluginError(pluginName, 'You have uncommitted changes: commit')
  }
  await gitExec('remote update', pluginName, options)
  const local = await gitExec('rev-parse @', pluginName, options)
  const remote = await gitExec('rev-parse @{u}', pluginName, options)
  if (local === remote) {
    return 'Up to date'
  }
  const base = await gitExec('merge-base @ @{u}', pluginName, options)
  if (local === base) {
    throw new PluginError(pluginName, 'You are behind origin: pull')
  } else if (remote === base) {
    return 'Ahead of origin, need to push'
  } else {
    throw new PluginError(
      pluginName,
      'You have diverged from origin: pull and merge',
    )
  }
}
