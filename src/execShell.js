import childProcess from 'child_process'
import { promisify } from 'util'
import { defaultOptions, handleExecError } from './execCommon'

const exec = promisify(childProcess.exec)

export default async (command, options) => {
  try {
    const defaultedOptions = await defaultOptions(options)
    const { stdout } = await exec(command, defaultedOptions)
    return stdout
  } catch (e) {
    throw handleExecError('@mindhive/deploy/execShell', command, e)
  }
}
