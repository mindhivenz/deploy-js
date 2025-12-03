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
      pluginName: '@mindhivenz/deploy/gitHash',
    })
  }
  const { stdOut: hashOut } = await execFile(
    'git',
    ['rev-parse', '--short', 'HEAD'],
    {
      cwd: repoPath,
      captureOutput: true,
    },
  )
  const parts = ['git', hashOut.trim()]

  return parts.join('-')
}
