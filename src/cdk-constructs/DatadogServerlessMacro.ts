/* tslint:disable no-unused-expression */
import { CfnMapping, Stack, aws_logs, aws_lambda } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import importDatadogForwarderArn from './importDatadogForwarderArn'

interface DatadogServerlessProps {
  logLevel?: 'INFO' | 'DEBUG'
  service?: string
  env?: string
}

export class DatadogServerlessMacro extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: DatadogServerlessProps = {},
  ) {
    super(scope, id)
    const stack = Stack.of(this)
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

  monitorFunction(func: aws_lambda.Function) {
    new aws_logs.CfnSubscriptionFilter(
      this,
      `${func.node.id}-DatadogSubscription`,
      {
        filterPattern: '',
        logGroupName: func.logGroup.logGroupName,
        destinationArn: importDatadogForwarderArn(),
      },
    )
  }
}
