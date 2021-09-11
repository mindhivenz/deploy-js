import { ManagedPolicy } from '@aws-cdk/aws-iam'

export const ssmAgentManagedPolicies = [
  ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
  ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
]
