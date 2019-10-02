import flatten from 'lodash/flatten'
import awsCredentialsEnv from './awsCredentialsEnv'
import execFile from './execFile'
import { IExecOpts } from './internal/execCommon'
import publicStageName from './publicStageName'

type IServerlessArgs = Record<string, string | true>

export interface IServerlessCommand extends IExecOpts {
  proj: string
  stage: string
  command: string
  args?: IServerlessArgs
}

const serializeServerlessArgs = (args: IServerlessArgs) =>
  flatten(
    Object.entries(args).map(([k, v]) =>
      v === true ? [`--${k}`] : [`--${k}`, v],
    ),
  )

const task = async ({
  proj,
  stage,
  command,
  args = {},
  env = process.env,
  ...options
}: IServerlessCommand): Promise<string | undefined> => {
  const credentialsEnv = await awsCredentialsEnv({ proj, stage })
  return await execFile(
    'serverless',
    [
      ...command.split(/\s+/),
      ...serializeServerlessArgs({
        stageLocal: stage,
        stagePublic: publicStageName(stage),
        ...args,
      }),
    ],
    {
      env: {
        ...env,
        ...credentialsEnv,
      },
      ...options,
    },
  )
}

type IFixedServerlessOptions = Pick<
  IServerlessCommand,
  'proj' | 'stage' | 'cwd'
>

type ICurriedServerlessOptions = Pick<
  IServerlessCommand,
  Exclude<keyof IServerlessCommand, keyof IFixedServerlessOptions>
>

export const taskFactory = (fixedOptions: IFixedServerlessOptions) => (
  options: ICurriedServerlessOptions,
) =>
  task({
    ...fixedOptions,
    ...options,
  })

export default task
