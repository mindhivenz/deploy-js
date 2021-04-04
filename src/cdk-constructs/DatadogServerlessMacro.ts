/* tslint:disable no-unused-expression */
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda'
import { CfnSubscriptionFilter } from '@aws-cdk/aws-logs'
import { CfnMapping, Construct, Stack } from '@aws-cdk/core'
import importDatadogForwarderArn from './importDatadogForwarderArn'

interface DatadogServerlessProps {
  logLevel?: 'INFO' | 'DEBUG'
  service?: string
  env?: string
}

export class DatadogServerlessMacro extends Construct {
  constructor(stack: Stack, id: string, props: DatadogServerlessProps = {}) {
    super(stack, id)
    new CfnMapping(stack, 'Datadog', {
      mapping: {
        Parameters: {
          nodeLayerVersion: '51',
          pythonLayerVersion: '32',
          stackName: stack.stackName,
          service: stack.stackName,
          logLevel: 'INFO',
          ...props,
        },
      },
    })
    stack.addTransform('DatadogServerless')
  }

  monitorFunction(func: LambdaFunction) {
    new CfnSubscriptionFilter(this, `${func.node.id}-DatadogSubscription`, {
      filterPattern: '',
      logGroupName: func.logGroup.logGroupName,
      destinationArn: importDatadogForwarderArn(),
    })
  }
}
