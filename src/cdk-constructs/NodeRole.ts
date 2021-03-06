import {
  ManagedPolicy,
  Role,
  RoleProps,
  ServicePrincipal,
} from '@aws-cdk/aws-iam'
import { Construct } from '@aws-cdk/core'
import { nodeRoleName } from '../internal/sharedNames'

const ssmAgentPolicies = [
  ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
  ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
]
const ssmPrincipal = new ServicePrincipal('ssm.amazonaws.com')

interface NodeRoleProps extends Omit<RoleProps, 'assumedBy' | 'roleName'> {
  customer: string
}

export class NodeRole extends Role {
  constructor(
    scope: Construct,
    id: string,
    { customer, managedPolicies = [], ...props }: NodeRoleProps,
  ) {
    super(scope, id, {
      assumedBy: ssmPrincipal,
      description: `Role for ${customer} SSM managed instances`,
      managedPolicies: [...ssmAgentPolicies, ...managedPolicies],
      roleName: nodeRoleName(customer),
      ...props,
    })
  }
}
