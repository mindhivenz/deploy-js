import awsCredentialsEnv from './awsCredentialsEnv'
import execFile, { IExecFileOptions } from './execFile'
import publicStageName from './publicStageName'

type IServerlessArgs = Record<string, string | true>

interface IServerlessCommand extends IExecFileOptions {
  proj: string
  stage: string
  command: string
  args?: IServerlessArgs
  env?: Record<string, string>
}

const serializeServerlessArgs = (args: IServerlessArgs) =>
  Object.entries(args).flatMap(([k, v]) =>
    v === true ? [`--${k}`] : [`--${k}`, v],
  )

export default async ({
  proj,
  stage,
  command,
  args = {},
  env = {},
  ...options
}: IServerlessCommand) => {
  const credentialsEnv = await awsCredentialsEnv({ proj, stage })
  await execFile(
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
