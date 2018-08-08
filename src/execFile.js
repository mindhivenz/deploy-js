import { execFile } from 'child_process'
import { execCommon } from './execCommon'

export default async (file, args, options) =>
  execCommon(
    execFile.bind(null, file, args),
    '@mindhive/deploy/execFile',
    [file, ...args].join(' '),
    options,
  )
