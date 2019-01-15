import { execFile, ExecFileOptions } from 'child_process'
import { execCommon, ILocalOptions } from './internal/execCommon'

export type IExecFileOptions = ILocalOptions & ExecFileOptions

export default async (
  file: string,
  args: string[] = [],
  options: IExecFileOptions = {},
) =>
  execCommon(
    (execOptions, callback) => execFile(file, args, execOptions, callback),
    '@mindhive/deploy/execFile',
    [file, ...args].join(' '),
    options,
  )
