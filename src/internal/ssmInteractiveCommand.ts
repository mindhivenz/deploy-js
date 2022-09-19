import awsCredentialsEnv from '../awsCredentialsEnv'
import { IRegionalProjOptions } from '../awsProjOptions'
import execFile from '../execFile'

export const ssmInteractiveCommand = async (
  projOptions: IRegionalProjOptions,
  instanceId: string,
  command: string,
) => {
  const awsEnv = await awsCredentialsEnv({
    fullDurationSession: true,
    ...projOptions,
  })
  process.stdin.setRawMode(true)
  const sigIntHandler = () => {
    // Ignore it so we don't quit if ctrl-c in shell
  }
  process.on('SIGINT', sigIntHandler)
  try {
    await execFile(
      'aws',
      [
        'ssm',
        'start-session',
        ...['--target', instanceId],
        // REVISIT: an alternative is to use the new ShellProfile of SSM-SessionManagerRunShell in agent 3.0
        ...['--document-name', 'AWS-StartInteractiveCommand'],
        ...['--parameters', command],
      ],
      {
        env: {
          ...process.env,
          ...awsEnv,
        },
        pipeInput: true,
        pipeOutput: true,
      },
    )
  } finally {
    process.off('SIGINT', sigIntHandler)
  }
}
