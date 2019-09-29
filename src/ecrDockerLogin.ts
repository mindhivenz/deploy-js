import memoize from 'lodash/memoize'
import execFile from './execFile'
import { dockerLoginArgs, IOptions } from './internal/ecr'

// Need to memoize otherwise multiple logins will screw things up
const login = async (options: IOptions) => {
  const args = await dockerLoginArgs(options)
  await execFile('docker', args)
}

export default memoize(
  login,
  ({ proj, stage, region }: IOptions) => `${proj}/${stage}/${region}`,
) as typeof login
