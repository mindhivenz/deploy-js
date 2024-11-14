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
  const { stdOut: hashOut } = await execFile(
    'git',
    ['rev-parse', '--short', 'HEAD'],
    {
      cwd: repoPath,
      captureOutput: true,
    },
  )
  const { stdOut: branchOut } = await execFile(
    'git',
    ['rev-parse', '--abbrev-ref', 'HEAD'],
    {
      cwd: repoPath,
      captureOutput: true,
    },
  )
  const parts = ['git', hashOut.trim()]
  if (!['master', 'main', 'production'].includes(branchOut.trim())) {
    parts.push(branchOut.trim().replace(/[^a-zA-Z0-9-_.]/g, '_'))
  }
  return parts.join('-')
}
