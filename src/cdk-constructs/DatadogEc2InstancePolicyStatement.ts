import { PolicyStatement } from '@aws-cdk/aws-iam'

export class DatadogEc2InstancePolicyStatement extends PolicyStatement {
  constructor() {
    super({
      sid: 'DatadogEc2Access',
      actions: ['ec2:Describe*', 'ec2:Get*'],
      resources: ['*'],
    })
  }
}
