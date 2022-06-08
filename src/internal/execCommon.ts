import { spawn, SpawnOptions } from 'child_process'
import log from 'fancy-log'
import findUp from 'find-up'
import path from 'path'
import PluginError from 'plugin-error'
import shellEscape from 'shell-escape'
import { globalArgs } from './args'
import { commandLine, dim, error } from '../colors'

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
  okExitCodes?: number[]
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
    env: passedEnv = process.env,
    pipeInput = false,
    captureOutput = false,
    pipeOutput,
    okExitCodes = [0],
  }: IExecOpts = {},
): Promise<string> => {
  const argv = await globalArgs.argv
  if (pipeOutput === undefined) {
    pipeOutput = !!argv.verbose
  }
  const binDirs = await nodeModulesBinDirs(String(cwd))
  const env = { ...passedEnv }
  env.PATH = [...binDirs, ...(env.PATH ? [env.PATH] : [])].join(path.delimiter)

  const commandDescription = (): string =>
    commandLine(shellEscape([command, ...args]))

  if (argv.verbose) {
    log(commandDescription())
  }
  return await new Promise<string>((resolve, reject) => {
    const stdOutBuffers: Buffer[] = []
    const stdErrBuffers: Buffer[] = []
    let rejected = false

    const concatBuffers = (buffers: Buffer[]): string =>
      Buffer.concat(buffers).toString().trim()

    const rejectWith = (err: Error | string) => {
      if (rejected) {
        return
      }
      log(`${error('Errored:')} ${commandDescription()}`)
      if (!pipeOutput) {
        const stdOut = concatBuffers(stdOutBuffers)
        const stdErr = concatBuffers(stdErrBuffers)
        if (stdOut) {
          log(`${dim('-- stdout --')}\n${stdOut}`)
        }
        if (stdErr) {
          log(`${dim('-- stderr --')}\n${stdErr}`)
        }
      }
      const message =
        typeof err === 'string'
          ? err
          : err.message || 'spawn failed without message'
      reject(new PluginError(pluginName, message))
      rejected = true
    }

    const subProcess = spawn(command, args, {
      cwd,
      env,
      shell,
      stdio: [
        pipeInput ? 'inherit' : 'ignore',
        !captureOutput && pipeOutput ? 'inherit' : 'pipe',
        pipeOutput ? 'inherit' : 'pipe',
      ],
    })
      .on('error', (e) => {
        if (!pipeOutput) {
          if (subProcess.stdout) {
            subProcess.stdout.destroy()
          }
          if (subProcess.stderr) {
            subProcess.stderr.destroy()
          }
        }
        if ((e as any).code === 'ENOENT') {
          log(`PATH=${env.PATH}`)
          rejectWith(
            `Couldn't find "${command}" to execute or current directory (cwd) "${cwd}" is not valid`,
          )
        } else {
          rejectWith(e)
        }
      })
      .on('close', (code, signal) => {
        if (signal) {
          rejectWith(`Exited with signal ${signal}`)
        } else if (code && !okExitCodes.includes(code)) {
          rejectWith(`Exited with code ${code}`)
        } else {
          resolve(captureOutput ? concatBuffers(stdOutBuffers) : '')
        }
      })
    if ((captureOutput || !pipeOutput) && subProcess.stdout) {
      subProcess.stdout.on('data', (chunk) => {
        if (pipeOutput) {
          process.stdout.write(chunk)
        }
        stdOutBuffers.push(chunk)
      })
    }
    if (!pipeOutput && subProcess.stderr) {
      subProcess.stderr.on('data', (chunk) => {
        stdErrBuffers.push(chunk)
      })
    }
  })
}
