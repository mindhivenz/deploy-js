import gitExec from './gitExec'


export default async (repoPath) => {
  await gitExec('push', 'gitPush', { cwd: repoPath })
}
