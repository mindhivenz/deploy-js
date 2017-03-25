import git from 'gulp-git'


export default async (gitCommand, pluginName, options) =>
  new Promise((resolve, reject) => {
    git.exec(
      {
        args: gitCommand,
        ...options,
      },
      (err, stdout) => {
        if (err) {
          reject(err)
        } else {
          resolve(stdout.trim())
        }
      }
    )
  })
