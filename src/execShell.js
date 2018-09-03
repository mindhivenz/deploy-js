import { exec } from 'child_process'
import { execCommon } from './execCommon'

export default async (command, options) =>
  execCommon(
    (...rest) => exec(command, ...rest),
    '@mindhive/deploy/execShell',
    command,
    options,
  )
