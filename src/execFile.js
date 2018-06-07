import childProcess from 'child_process'
import { promisify } from 'util'
import { defaultOptions, handleExecError } from './execCommon'

const execFile = promisify(childProcess.execFile)

export default async (file, args, options) => {
  try {
    const defaultedOptions = await defaultOptions(options)
    const { stdout } = await execFile(file, args, defaultedOptions)
    return stdout
  } catch (e) {
    throw handleExecError('@mindhive/deploy/execFile', [file, ...args].join(' '), e)
  }
}
