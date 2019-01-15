import { exec, ExecOptions } from 'child_process'
import { execCommon } from './internal/execCommon'

export default async (command: string, options: ExecOptions) =>
  execCommon(
    (execOptions, callback) => exec(command, execOptions, callback),
    '@mindhive/deploy/execShell',
    command,
    options,
  )
