import { execCommand, IExecOpts, IExecResult } from './internal/execCommon'

export default async (
  file: string,
  args: string[] = [],
  opts: IExecOpts = {},
): Promise<IExecResult> =>
  await execCommand(
    { shell: false, pluginName: '@mindhivenz/deploy/execFile' },
    file,
    args,
    opts,
  )
