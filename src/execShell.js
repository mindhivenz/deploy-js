import { exec } from 'child_process'
import { defaultOptions, handleExecError } from './execCommon'

export default async (command, options) => {
  const defaultedOptions = await defaultOptions(options)
  return await new Promise((resolve, reject) => {
    const subprocess = exec(
      command,
      defaultedOptions,
      (error, stdout, stderr) => {
        if (error) {
          reject(
            handleExecError(
              '@mindhive/deploy/execFile',
              command,
              error,
              stdout,
              stderr,
            ),
          )
        } else {
          resolve(stdout)
        }
      },
    )
    subprocess.stdin.end() // Otherwise it will block
  })
}
