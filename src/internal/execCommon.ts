import colors from 'ansi-colors'
import { ChildProcess, ExecFileOptions, ExecOptions } from 'child_process'
import log from 'fancy-log'
import findUp from 'find-up'
import path from 'path'
import PluginError from 'plugin-error'
import yargs from 'yargs'

const { verbose } = yargs.option('verbose', {
  describe: 'Stream all sub-process output to console',
}).argv

export interface ILocalOptions {
  pipeOutput?: boolean
}

export type ExecCallback = (
  error: Error | null,
  stdout?: string | Buffer,
  stderr?: string | Buffer,
) => void

export type ExecFunc = (options: any, callback: ExecCallback) => ChildProcess

export const execCommon = async (
  execFunc: ExecFunc,
  pluginName: string,
  commandDescription: string,
  {
    pipeOutput = !!verbose,
    ...execOptions
  }: ILocalOptions & ExecOptions & ExecFileOptions = {},
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

  const execError = (
    error?: Error,
    stdout?: string | Buffer,
    stderr?: string | Buffer,
  ) => {
    log(colors.red('Error'), colors.blue(commandDescription))
    if (!pipeOutput) {
      if (stdout) {
        log(`${colors.dim('-- stdout --')}\n${stdout}`)
      }
      if (stderr) {
        log(`${colors.dim('-- stderr --')}\n${stderr}`)
      }
    }
    return new PluginError(
      pluginName,
      (error && error.message) || 'exec failed without message',
    )
  }

  const defaultedOptions = await defaultExecOptions()
  if (verbose) {
    log(colors.blue(commandDescription))
  }
  return await new Promise((resolve, reject) => {
    const subprocess = execFunc(defaultedOptions, (error, stdout, stderr) => {
      if (error) {
        reject(execError(error, stdout, stderr))
      } else {
        resolve(stdout)
      }
    })
    if (pipeOutput) {
      subprocess.stdout.pipe(process.stdout)
      subprocess.stderr.pipe(process.stderr)
    }
    subprocess.stdin.end() // Otherwise it will block
  })
}
