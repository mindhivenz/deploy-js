import PluginError from 'plugin-error'

import { gitExec } from './internal/git'

const pluginName = '@mindhive/deploy/ensureBranch'

export default async (requiredBranch: string, repoPath: string) => {
  const actualBranch = await gitExec(
    'rev-parse --abbrev-ref HEAD',
    'ensureBranch',
    { cwd: repoPath },
  )
  if (requiredBranch !== actualBranch) {
    throw new PluginError(
      pluginName,
      `You are on ${actualBranch}, not ${requiredBranch}`,
    )
  }
}
