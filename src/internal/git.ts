// @ts-ignore
import git from 'gulp-git'

const defaultOptions = {
  quiet: true,
}

export const gitExec = async (
  gitCommand: string,
  pluginName: string,
  options?: object,
) =>
  new Promise((resolve, reject) => {
    git.exec(
      {
        ...defaultOptions,
        args: gitCommand,
        ...options,
      },
      (err: Error | null, stdout: string) => {
        if (err) {
          reject(err)
        } else {
          resolve(stdout.trim())
        }
      },
    )
  })
