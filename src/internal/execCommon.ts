import colors from 'ansi-colors'
import { ChildProcess } from 'child_process'
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

export type ExecFunc = (callback: ExecCallback) => ChildProcess

interface IMangedExecOptions {
  cwd?: string
  maxBuffer?: number
  env?: NodeJS.ProcessEnv
}

export const defaultExecOptions = async <T extends IMangedExecOptions>(
  options: T,
): Promise<T> => {
  const {
    cwd = process.cwd(),
    maxBuffer = 10 * 1024 * 1024,
    env: baseEnv = process.env,
  } = options
  // REVISIT: Does typescript 3.6 fix this?
  const nodeModules = await findUp('node_modules', {
    cwd,
    type: 'directory',
  })
  if (!nodeModules) {
    return {
      ...options,
      cwd,
      maxBuffer,
    }
  }
  const binDir = path.join(nodeModules, '.bin')
  const pathEnv = baseEnv.PATH
    ? `${binDir}${path.delimiter}${baseEnv.PATH}`
    : binDir
  return {
    ...options,
    cwd,
    env: {
      ...baseEnv,
      PATH: baseEnv.PATH ? `${binDir}${path.delimiter}${baseEnv.PATH}` : binDir,
    },
    maxBuffer,
  }
}

export const execCommon = async (
  execFunc: ExecFunc,
  pluginName: string,
  commandDescription: string,
  { pipeOutput = !!verbose }: ILocalOptions = {},
): Promise<string> => {
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

  if (verbose) {
    log(colors.blue(commandDescription))
  }
  return await new Promise((resolve, reject) => {
    const subprocess = execFunc((error, stdout, stderr) => {
      if (error) {
        reject(execError(error, stdout, stderr))
      } else {
        resolve(stdout as string)
      }
    })
    if (pipeOutput) {
      subprocess.stdout!.pipe(process.stdout)
      subprocess.stderr!.pipe(process.stderr)
    }
    subprocess.stdin!.end() // Otherwise it will block
  })
}
