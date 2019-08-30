import colors from 'ansi-colors'
import { ChildProcess } from 'child_process'
import log from 'fancy-log'
import findUp from 'find-up'
import path from 'path'
import PluginError from 'plugin-error'
import { globalArgs } from './args'

const { verbose } = globalArgs.argv

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

const nodeModulesBinDirs = async (cwd: string): Promise<string[]> => {
  const paths: string[] = []
  let currentDir = cwd
  do {
    const nodeModules = await findUp('node_modules', {
      cwd: currentDir,
      type: 'directory',
    })
    if (!nodeModules) {
      break
    }
    paths.push(path.join(nodeModules, '.bin'))
    currentDir = path.dirname(path.dirname(nodeModules))
  } while (currentDir !== '/')
  return paths
}

export const defaultExecOptions = async <T extends IMangedExecOptions>(
  options: T,
): Promise<T> => {
  const {
    cwd = process.cwd(),
    maxBuffer = 10 * 1024 * 1024,
    env: baseEnv = process.env,
  } = options
  const result: T = {
    ...options,
    cwd,
    maxBuffer,
  }
  const binDirs = await nodeModulesBinDirs(cwd)
  const existingPathDirs = baseEnv.PATH
    ? baseEnv.PATH.split(path.delimiter)
    : []
  const pathAdditions = binDirs.filter(p => !existingPathDirs.includes(p))
  if (!pathAdditions.length) {
    return result
  }
  const pathEnv = (baseEnv.PATH
    ? [...pathAdditions, baseEnv.PATH]
    : pathAdditions
  ).join(path.delimiter)
  return {
    ...result,
    env: {
      ...baseEnv,
      PATH: pathEnv,
    },
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
