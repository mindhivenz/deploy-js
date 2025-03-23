import { aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface NodeRoleProps extends Omit<aws_iam.RoleProps, 'assumedBy' | 'roleName'> {
    customer: string;
}
export declare class NodeRole extends aws_iam.Role {
    constructor(scope: Construct, id: string, { customer, managedPolicies, ...props }: NodeRoleProps);
}
export {};
