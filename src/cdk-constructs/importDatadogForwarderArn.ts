import { Fn } from '@aws-cdk/core'
import { forwarderArnExportName } from '../internal/datadog'

export default (): string => Fn.importValue(forwarderArnExportName)
