import { execCommand, IExecOpts } from './internal/execCommon'

export default async (
  file: string,
  args: string[] = [],
  opts: IExecOpts = {},
) =>
  await execCommand(
    { shell: false, pluginName: '@mindhive/deploy/execFile' },
    file,
    args,
    opts,
  )
