import { execCommand, IExecOpts } from './internal/execCommon'

export default async (
  command: string,
  args: string[] = [],
  opts: IExecOpts = {},
) =>
  await execCommand(
    { shell: true, pluginName: '@mindhive/deploy/execShell' },
    command,
    args,
    opts,
  )
