import log from 'fancy-log'
import PluginError from 'plugin-error'
import path from 'path'
import colors from 'ansi-colors'
import findUp from 'find-up'

export const execCommon = async (
  execFunc,
  pluginName,
  commandDescription,
  { pipeOutput = false, ...execOptions } = {},
) => {
  const defaultExecOptions = async () => {
    const options = { ...execOptions } // copy, don't modify the original
    if (!options.cwd) {
      options.cwd = process.cwd()
    }
    if (!options.maxBuffer) {
      options.maxBuffer = 10 * 1024 * 1024
    }
    const nodeModules = await findUp('node_modules', { cwd: options.cwd })
    if (nodeModules) {
      const binDir = path.join(nodeModules, '.bin')
      if (options.env) {
        options.env = { ...options.env } // copy, don't modify the original
      } else {
        options.env = { ...process.env } // copy, don't modify the original
      }
      if (options.env.PATH) {
        options.env.PATH = `${binDir}${path.delimiter}${options.env.PATH}`
      } else {
        options.env.PATH = binDir
      }
    }
    return options
  }

  const pipeStdOutput = (src, dst) => {
    if (src) {
      src.on('data', data => {
        dst.write(data)
      })
    }
  }

  const execError = (e, stdout, stderr) => {
    log(colors.red('Error'), colors.blue(commandDescription))
    if (!pipeOutput) {
      if (stdout) {
        log(`${colors.dim('-- stdout --')}\n${stdout}`)
      }
      if (stderr) {
        log(`${colors.dim('-- stderr --')}\n${stderr}`)
      }
    }
    return new PluginError(pluginName, e.message)
  }

  const defaultedOptions = await defaultExecOptions()
  return await new Promise((resolve, reject) => {
    const subprocess = execFunc(defaultedOptions, (error, stdout, stderr) => {
      if (error) {
        reject(execError(pluginName, commandDescription, error, stdout, stderr))
      } else {
        resolve(stdout)
      }
    })
    if (pipeOutput) {
      pipeStdOutput(subprocess.stdout, process.stdout)
      pipeStdOutput(subprocess.stderr, process.stderr)
    }
    subprocess.stdin.end() // Otherwise it will block
  })
}
