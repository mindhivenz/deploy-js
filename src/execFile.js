import { execFile } from 'child_process'
import { defaultOptions, handleExecError } from './execCommon'

export default async (file, args, options) => {
  const defaultedOptions = await defaultOptions(options)
  return await new Promise((resolve, reject) => {
    const subprocess = execFile(
      file,
      args,
      defaultedOptions,
      (error, stdout, stderr) => {
        if (error) {
          reject(
            handleExecError(
              '@mindhive/deploy/execFile',
              [file, ...args].join(' '),
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
