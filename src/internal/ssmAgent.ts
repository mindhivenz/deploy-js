import { aws_iam } from 'aws-cdk-lib'

export const ssmAgentManagedPolicies = [
  aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
    'AmazonSSMManagedInstanceCore',
  ),
  aws_iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
]
