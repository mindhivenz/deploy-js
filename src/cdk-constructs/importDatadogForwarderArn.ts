import { Fn } from 'aws-cdk-lib'
import { forwarderArnExportName } from '../internal/datadog'

export default (): string => Fn.importValue(forwarderArnExportName)
