import { execFile, ExecFileOptions } from 'child_process'
import {
  defaultExecOptions,
  execCommon,
  ILocalOptions,
} from './internal/execCommon'

export type IExecFileOptions = ILocalOptions & ExecFileOptions

export default async (
  file: string,
  args: string[] = [],
  { pipeOutput, ...execOpts }: IExecFileOptions = {},
) => {
  const fullOpts = await defaultExecOptions(execOpts)
  return await execCommon(
    callback => execFile(file, args, fullOpts, callback),
    '@mindhive/deploy/execFile',
    [file, ...args].join(' '),
    { pipeOutput },
  )
}
