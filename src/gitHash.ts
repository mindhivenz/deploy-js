import execFile from './execFile'

export default async (repoPath: string) =>
  await execFile('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: repoPath,
    captureOutput: true,
  })
