import execFile from './execFile'

export default async (repoPath?: string, remote: string = 'origin') => {
  await execFile('git', ['push', '--follow-tags', remote], {
    cwd: repoPath,
  })
}
