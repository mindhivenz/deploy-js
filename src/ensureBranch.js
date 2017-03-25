import gutil from 'gulp-util'

import gitExec from './gitExec'


const pluginName = 'ensureBranch'

export default async (requiredBranch, repoPath) => {
  const actualBranch = await gitExec('rev-parse --abbrev-ref HEAD', 'ensureBranch', { cwd: repoPath })
  if (requiredBranch !== actualBranch) {
    throw new gutil.PluginError(pluginName, `You are on ${actualBranch}, not ${requiredBranch}`)
  }
}
