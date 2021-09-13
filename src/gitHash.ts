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
  return await execFile('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: repoPath,
    captureOutput: true,
  })
}
