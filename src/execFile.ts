import { execCommand, IExecOpts, IExecResult } from './internal/execCommon'

export default async (
  file: string,
  args: string[] = [],
  opts: IExecOpts = {},
): Promise<IExecResult> =>
  await execCommand(
    { shell: false, pluginName: '@mindhive/deploy/execFile' },
    file,
    args,
    opts,
  )
