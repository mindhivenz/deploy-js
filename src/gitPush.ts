import { gitExec } from './internal/git'

export default async (repoPath: string, remote: string = 'origin') => {
  await gitExec(`push --follow-tags ${remote}`, 'gitPush', {
    cwd: repoPath,
  })
}
