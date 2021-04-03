import { Fn } from '@aws-cdk/core'
import { datadogForwarderStackName } from '../datadogForwarderTask'

export default (): string =>
  Fn.importValue(`${datadogForwarderStackName}-ForwarderArn`)
