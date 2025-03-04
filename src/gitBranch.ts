import ensureGitUpToDate from './ensureGitUpToDate'
import execFile from './execFile'

interface IOptions {
  gitUpToDate?: boolean
}

export default async (
  repoPath?: string,
  { gitUpToDate = false }: IOptions = {},
): Promise<string> => {
  if (gitUpToDate) {
    await ensureGitUpToDate(repoPath, {
      pluginName: '@mindhive/deploy/gitHash',
    })
  }
  const { stdOut: branchOut } = await execFile(
    'git',
    ['rev-parse', '--abbrev-ref', 'HEAD'],
    {
      cwd: repoPath,
      captureOutput: true,
    },
  )

  return branchOut.trim()
}
