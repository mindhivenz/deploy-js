import { exec } from 'child_process'
import { execCommon } from './execCommon'

export default async (command, options) =>
  execCommon(
    exec.bind(null, command),
    '@mindhive/deploy/execShell',
    command,
    options,
  )
