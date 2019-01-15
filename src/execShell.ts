import { exec, ExecOptions } from 'child_process'
import { execCommon, ILocalOptions } from './internal/execCommon'

export type IExecShellOptions = ILocalOptions & ExecOptions

export default async (command: string, options: IExecShellOptions) =>
  execCommon(
    (execOptions, callback) => exec(command, execOptions, callback),
    '@mindhive/deploy/execShell',
    command,
    options,
  )
