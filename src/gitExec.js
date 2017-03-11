import shell from 'shelljs'
import gutil from 'gulp-util'


const defaultOptions = options => ({
  timeout: 5000,
  silent: true,
  ...options,
})

const resultError = ({ gitCommand, pluginName = 'gitExec', code, stderr }) => {
  if (code !== 0) {
    return new gutil.PluginError(
      pluginName,
      `Failed (exit code ${code}) to execute git command "${gitCommand}": ${stderr}`,
    )
  }
  return null
}

const resultText = stdout =>
  stdout.trim()

export const sync = (gitCommand, pluginName, options) => {
  const result = shell.exec(`git ${gitCommand}`, defaultOptions(options))
  const error = resultError({ gitCommand, pluginName, ...result })
  if (error) {
    throw error
  }
  return resultText(result.stdout)
}

export default async (gitCommand, pluginName, options) =>
  new Promise((resolve, reject) => {
    shell.exec(`git ${gitCommand}`, defaultOptions(options), (code, stdout, stderr) => {
      if (code !== 0) {
        reject(resultError({ gitCommand, pluginName, code, stderr }))
      } else {
        resolve(resultText(stdout))
      }
    })
  })
