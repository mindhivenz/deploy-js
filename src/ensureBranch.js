import PluginError from 'plugin-error'

import gitExec from './gitExec'


const pluginName = '@mindhive/deploy/ensureBranch'

export default async (requiredBranch, repoPath) => {
  const actualBranch = await gitExec('rev-parse --abbrev-ref HEAD', 'ensureBranch', { cwd: repoPath })
  if (requiredBranch !== actualBranch) {
    throw new PluginError(pluginName, `You are on ${actualBranch}, not ${requiredBranch}`)
  }
}
