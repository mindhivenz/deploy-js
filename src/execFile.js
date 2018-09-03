import { execFile } from 'child_process'
import { execCommon } from './execCommon'

export default async (file, args, options) =>
  execCommon(
    (...rest) => execFile(file, args, ...rest),
    '@mindhive/deploy/execFile',
    [file, ...args].join(' '),
    options,
  )
