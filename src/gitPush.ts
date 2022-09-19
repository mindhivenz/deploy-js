import log from 'fancy-log'
import execFile from './execFile'
import { globalArgs, parseArgs } from './internal/args'

export default async (repoPath?: string, remote: string = 'origin') => {
  const { ignoreGit } = parseArgs(globalArgs, { complete: false })
  if (ignoreGit) {
    log('Not pushing')
    return
  }
  await execFile('git', ['push', '--follow-tags', remote], {
    cwd: repoPath,
  })
}
