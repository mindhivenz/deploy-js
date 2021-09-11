import { Role, RoleProps, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Construct } from '@aws-cdk/core'
import { ssmAgentManagedPolicies } from '../internal/ssmAgent'

const ec2Principal = new ServicePrincipal('ec2.amazonaws.com')

export class Ec2Role extends Role {
  constructor(
    scope: Construct,
    id: string,
    { managedPolicies = [], ...props }: Omit<RoleProps, 'assumedBy'>,
  ) {
    super(scope, id, {
      assumedBy: ec2Principal,
      managedPolicies: [...ssmAgentManagedPolicies, ...managedPolicies],
      ...props,
    })
  }
}
