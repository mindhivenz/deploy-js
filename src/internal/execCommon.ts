import colors from 'ansi-colors'
import { spawn, SpawnOptions } from 'child_process'
import log from 'fancy-log'
import findUp from 'find-up'
import path from 'path'
import PluginError from 'plugin-error'
import shellEscape from 'shell-escape'
import { globalArgs } from './args'

const { verbose } = globalArgs.argv

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

export interface IExecOpts extends Pick<SpawnOptions, 'cwd' | 'env'> {
  pipeInput?: boolean
  captureOutput?: boolean
  pipeOutput?: boolean
}

export interface IInternalExecOpts {
  shell: boolean
  pluginName: string
}

export const execCommand = async (
  { shell, pluginName }: IInternalExecOpts,
  command: string,
  args: Readonly<string[]>,
  {
    cwd = process.cwd(),
    env = { ...process.env },
    pipeInput = false,
    captureOutput = false,
    pipeOutput = !!verbose,
  }: IExecOpts = {},
): Promise<string | undefined> => {
  const binDirs = await nodeModulesBinDirs(cwd)
  env.PATH = [...binDirs, ...(env.PATH ? [env.PATH] : [])].join(path.delimiter)

  const commandDescription = (): string =>
    colors.blue(shellEscape([command, ...args]))

  if (verbose) {
    log(commandDescription())
  }
  return await new Promise((resolve, reject) => {
    const stdOutBuffers: Buffer[] = []
    const stdErrBuffers: Buffer[] = []

    const concatBuffers = (buffers: Buffer[]): string =>
      Buffer.concat(buffers).toString()

    const rejectWith = (error: Error | string) => {
      log(`${colors.red('Errored:')} ${commandDescription()}`)
      if (!pipeOutput) {
        const stdOut = concatBuffers(stdOutBuffers)
        const stdErr = concatBuffers(stdErrBuffers)
        if (stdOut) {
          log(`${colors.dim('-- stdout --')}\n${stdOut}`)
        }
        if (stdErr) {
          log(`${colors.dim('-- stderr --')}\n${stdErr}`)
        }
      }
      const message =
        typeof error === 'string'
          ? error
          : error.message || 'spawn failed without message'
      reject(new PluginError(pluginName, message))
    }

    const subProcess = spawn(command, args, {
      cwd,
      env,
      stdio: [
        pipeInput ? 'inherit' : 'ignore',
        !captureOutput && pipeOutput ? 'inherit' : 'pipe',
        pipeOutput ? 'inherit' : 'pipe',
      ],
    })
      .on('error', e => {
        if (!pipeOutput) {
          if (subProcess.stdout) {
            subProcess.stdout.destroy()
          }
          if (subProcess.stderr) {
            subProcess.stderr.destroy()
          }
        }
        rejectWith(e)
      })
      .on('close', (code, signal) => {
        if (signal) {
          rejectWith(`Exited with signal ${signal}`)
        } else if (code !== 0) {
          rejectWith(`Exited with code ${code}`)
        } else {
          resolve(pipeOutput ? undefined : concatBuffers(stdOutBuffers))
        }
      })
    if ((captureOutput || !pipeOutput) && subProcess.stdout) {
      subProcess.stdout.on('data', chunk => {
        if (pipeOutput) {
          process.stdout.write(chunk)
        }
        return stdOutBuffers.push(chunk)
      })
    }
    if (!pipeOutput && subProcess.stderr) {
      subProcess.stderr.on('data', chunk => {
        return stdErrBuffers.push(chunk)
      })
    }
  })
}
