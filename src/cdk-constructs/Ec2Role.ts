import { aws_iam } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { ssmAgentManagedPolicies } from '../internal/ssmAgent'

const ec2Principal = new aws_iam.ServicePrincipal('ec2.amazonaws.com')

export class Ec2Role extends aws_iam.Role {
  constructor(
    scope: Construct,
    id: string,
    { managedPolicies = [], ...props }: Omit<aws_iam.RoleProps, 'assumedBy'>,
  ) {
    super(scope, id, {
      assumedBy: ec2Principal,
      managedPolicies: [...ssmAgentManagedPolicies, ...managedPolicies],
      ...props,
    })
  }
}
