import flatten from 'lodash/flatten'
import kebabCase from 'lodash/kebabCase'
import awsCredentialsEnv from './awsCredentialsEnv'
import execFile from './execFile'
import { IExecOpts } from './internal/execCommon'
import publicStageName from './publicStageName'

type IServerlessArgs = Record<string, string | true>

export interface IServerlessCommand extends IExecOpts {
  proj: string
  stage: string
  region?: string
  command: string
  args?: IServerlessArgs
}

const serializeServerlessArgs = (args: IServerlessArgs) =>
  flatten(
    Object.entries(args).map(([k, v]) => {
      const arg = `--${kebabCase(k)}`
      return v === true ? [arg] : [arg, v]
    }),
  )

const task = async ({
  proj,
  stage,
  region,
  command,
  args = {},
  env = process.env,
  ...options
}: IServerlessCommand): Promise<string> => {
  const credentialsEnv = await awsCredentialsEnv({ proj, stage, region })
  const { stdOut } = await execFile(
    'serverless',
    [...command.split(/\s+/), ...serializeServerlessArgs(args)],
    {
      env: {
        ...env,
        ...credentialsEnv,
        STAGE_LOCAL: stage,
        STAGE_PUBLIC: publicStageName(stage),
      },
      ...options,
    },
  )
  return stdOut
}

type IFixedServerlessOptions = Pick<
  IServerlessCommand,
  'proj' | 'stage' | 'region' | 'cwd'
>

type ICurriedServerlessOptions = Pick<
  IServerlessCommand,
  Exclude<keyof IServerlessCommand, keyof IFixedServerlessOptions>
>

export const taskFactory =
  (fixedOptions: IFixedServerlessOptions) =>
  (options: ICurriedServerlessOptions) =>
    task({
      ...fixedOptions,
      ...options,
    })

export default task
