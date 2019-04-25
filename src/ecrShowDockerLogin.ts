import colors from 'ansi-colors'
import { dockerLoginArgs, IOptions } from './internal/ecr'

// tslint:disable:no-console

export default async (options: IOptions) => {
  const args = await dockerLoginArgs(options)
  console.log(
    `Command line to login AWS ECR for ${options.proj}/${options.stage}:`,
  )
  console.log(colors.blue(['docker', ...args].join(' ')))
}