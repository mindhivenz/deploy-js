import { execFile, ExecFileOptions } from 'child_process'
import { execCommon } from './internal/execCommon'

export default async (
  file: string,
  args: string[] = [],
  options: ExecFileOptions = {},
) =>
  execCommon(
    (execOptions, callback) => execFile(file, args, execOptions, callback),
    '@mindhive/deploy/execFile',
    [file, ...args].join(' '),
    options,
  )
