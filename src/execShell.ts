import { execCommand, IExecOpts, IExecResult } from './internal/execCommon'

export default async (
  command: string,
  args: string[] = [],
  opts: IExecOpts = {},
): Promise<IExecResult> =>
  await execCommand(
    { shell: true, pluginName: '@mindhive/deploy/execShell' },
    command,
    args,
    opts,
  )
