import PluginError from 'plugin-error'
import execFile from './execFile'

// Based off: https://stackoverflow.com/a/3278427/3424884

interface IOptions {
  pluginName?: string
}

export default async (
  repoPath: string,
  { pluginName = '@mindhive/deploy/ensureGitUpToDate' }: IOptions = {},
) => {
  const options = { cwd: repoPath, captureOutput: true }
  try {
    await execFile(
      'git',
      ['diff-index', 'HEAD', '--quiet', '--exit-code'],
      options,
    )
  } catch (e) {
    throw new PluginError(pluginName, 'You have uncommitted changes: commit')
  }
  await execFile('git', ['remote', 'update'], options)
  const local = await execFile('git', ['rev-parse', '@'], options)
  const remote = await execFile('git', ['rev-parse', '@{u}'], options)
  if (local === remote) {
    return 'Up to date'
  }
  const base = await execFile('git', ['merge-base', '@', '@{u}'], options)
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
