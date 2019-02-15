import flatten from 'lodash/flatten'
import awsCredentialsEnv from './awsCredentialsEnv'
import execFile, { IExecFileOptions } from './execFile'
import publicStageName from './publicStageName'

type IServerlessArgs = Record<string, string | true>

export interface IServerlessCommand extends IExecFileOptions {
  proj: string
  stage: string
  command: string
  args?: IServerlessArgs
  env?: Record<string, string>
}

const serializeServerlessArgs = (args: IServerlessArgs) =>
  flatten(
    Object.entries(args).map(([k, v]) =>
      v === true ? [`--${k}`] : [`--${k}`, v],
    ),
  )

export default async ({
  proj,
  stage,
  command,
  args = {},
  env = {},
  ...options
}: IServerlessCommand): Promise<string> => {
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
        ...process.env,
        ...credentialsEnv,
        ...env,
      },
      ...options,
    },
  )
}
