import log from 'fancy-log'
import execFile from './execFile'
import { globalArgs } from './internal/args'

export default async (repoPath?: string, remote: string = 'origin') => {
  const { ignoreGit } = await globalArgs.option('ignore-git', {
    boolean: true,
  }).argv
  if (ignoreGit) {
    log('Skipping push')
    return
  }
  await execFile('git', ['push', '--follow-tags', remote], {
    cwd: repoPath,
  })
}
