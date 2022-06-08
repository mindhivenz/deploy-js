import { aws_iam } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { nodeRoleName } from '../internal/sharedNames'
import { ssmAgentManagedPolicies } from '../internal/ssmAgent'

const ssmPrincipal = new aws_iam.ServicePrincipal('ssm.amazonaws.com')

interface NodeRoleProps
  extends Omit<aws_iam.RoleProps, 'assumedBy' | 'roleName'> {
  customer: string
}

export class NodeRole extends aws_iam.Role {
  constructor(
    scope: Construct,
    id: string,
    { customer, managedPolicies = [], ...props }: NodeRoleProps,
  ) {
    super(scope, id, {
      assumedBy: ssmPrincipal,
      description: `Role for ${customer} SSM managed instances`,
      managedPolicies: [...ssmAgentManagedPolicies, ...managedPolicies],
      roleName: nodeRoleName(customer),
      ...props,
    })
  }
}
