import {
  AccountPrincipal,
  ManagedPolicy,
  PolicyDocument,
  Role,
  RoleProps,
  ServicePrincipal,
} from '@aws-cdk/aws-iam'
import { Construct } from '@aws-cdk/core'
import {
  DATADOG_ACCOUNT_ID,
  DATADOG_FORWARDER_POLICY,
} from '../internal/datadog'
import { nodeRoleName } from '../internal/sharedNames'

const ssmAgentPolicies = [
  ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
  ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
]
const ssmPrincipal = new ServicePrincipal('ssm.amazonaws.com')

interface DatadogRoleProps {
  externalId: string
  roleName?: string
}

export class DatadogForwarderRole extends Role {
  constructor(
    scope: Construct,
    id: string,
    { externalId, roleName = 'DatadogAWSIntegrationRole' }: DatadogRoleProps,
  ) {
    super(scope, id, {
      assumedBy: new AccountPrincipal(DATADOG_ACCOUNT_ID),
      externalIds: [externalId],
      roleName,
      inlinePolicies: {
        DatadogAWSIntegrationPolicy: PolicyDocument.fromJson(
          DATADOG_FORWARDER_POLICY,
        ),
      },
    })
  }
}
