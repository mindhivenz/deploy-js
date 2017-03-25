import git from 'gulp-git'


const defaultOptions = {
  quiet: true,
}

export default async (gitCommand, pluginName, options) =>
  new Promise((resolve, reject) => {
    git.exec(
      {
        ...defaultOptions,
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
