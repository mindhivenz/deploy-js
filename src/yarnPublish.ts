import execFile from './execFile'
import { yarnVersionBumpArgs } from './internal/yarnVersionBumpArgs'

interface IOptions {
  packageDir: string
  pipeOutput?: boolean
}

export default async ({ pipeOutput = false, packageDir }: IOptions) => {
  await execFile(
    'yarn',
    ['publish', '--non-interactive', ...(await yarnVersionBumpArgs())],
    {
      cwd: packageDir,
      pipeOutput,
    },
  )
}
