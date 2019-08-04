import { exec, ExecOptions } from 'child_process'
import {
  defaultExecOptions,
  execCommon,
  ILocalOptions,
} from './internal/execCommon'

export type IExecShellOptions = ILocalOptions & ExecOptions

export default async (
  command: string,
  { pipeOutput, ...execOpts }: IExecShellOptions = {},
) => {
  const fullOpts = await defaultExecOptions(execOpts)
  return await execCommon(
    callback => exec(command, fullOpts, callback),
    '@mindhive/deploy/execShell',
    command,
    { pipeOutput },
  )
}
