import colors from 'ansi-colors'
import { dockerLoginArgs, IOptions } from './internal/ecr'

// tslint:disable:no-console

export default async (options: IOptions) => {
  const args = await dockerLoginArgs(options)
  console.log(`To log  Docker into ${options.proj} ${options.stage} ECR:`)
  console.log(colors.blue(['docker', ...args].join(' ')))
}
