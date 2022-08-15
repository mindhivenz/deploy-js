import log from 'fancy-log'
import execFile from './execFile'
import { globalArgs } from './internal/args'

export default async (repoPath?: string, remote: string = 'origin') => {
  const { ignoreGit } = await globalArgs.argv
  if (ignoreGit) {
    log('Not pushing')
    return
  }
  await execFile('git', ['push', '--follow-tags', remote], {
    cwd: repoPath,
  })
}
