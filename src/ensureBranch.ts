import PluginError from 'plugin-error'
import execFile from './execFile'

const pluginName = '@mindhivenz/deploy/ensureBranch'

export default async (requiredBranch: string, repoPath?: string) => {
  const { stdOut: actualBranch } = await execFile(
    'git',
    ['rev-parse', '--abbrev-ref', 'HEAD'],
    { cwd: repoPath, captureOutput: true },
  )
  if (requiredBranch !== actualBranch) {
    throw new PluginError(
      pluginName,
      `You are on ${actualBranch}, not ${requiredBranch}`,
    )
  }
}
