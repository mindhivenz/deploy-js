import memoize from 'lodash/memoize'
import execFile from './execFile'
import { dockerLoginArgs, IOptions, optionsMemoKey } from './internal/ecr'

// Need to memoize otherwise multiple logins can screw things up
export default memoize(async (options: IOptions) => {
  const args = await dockerLoginArgs(options)
  await execFile('docker', args)
}, optionsMemoKey)
