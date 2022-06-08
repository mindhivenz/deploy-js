import memoize from 'lodash/memoize'
import * as path from 'path'
import PluginError from 'plugin-error'
import log from 'fancy-log'
import execFile from './execFile'
import { globalArgs } from './internal/args'

// Based off: https://stackoverflow.com/a/3278427/3424884

interface IOptions {
  pluginName?: string
}

export default memoize(
  async (
    repoPath: string = process.cwd(),
    { pluginName = '@mindhive/deploy/ensureGitUpToDate' }: IOptions = {},
  ): Promise<string> => {
    const argv = await globalArgs.option('ignore-git', {
      boolean: true,
    }).argv
    if (argv.ignoreGit) {
      log('Ignoring git state')
      return 'Ignoring git state'
    }
    const options = { cwd: repoPath, captureOutput: true }
    // status needed sometimes to update git
    await execFile('git', ['status'], options)
    try {
      await execFile(
        'git',
        ['diff-index', 'HEAD', '--quiet', '--exit-code'],
        options,
      )
    } catch (e) {
      throw new PluginError(
        pluginName,
        'You have uncommitted changes or need to pull',
      )
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
      log('Ahead of origin, need to push')
      return 'Ahead of origin, need to push'
    } else {
      throw new PluginError(
        pluginName,
        'You have diverged from origin: pull and merge',
      )
    }
  },
  (repoPath?: string) => (repoPath ? path.resolve(repoPath) : process.cwd()),
)
