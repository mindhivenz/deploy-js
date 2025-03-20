import { aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare class Ec2Role extends aws_iam.Role {
    constructor(scope: Construct, id: string, { managedPolicies, ...props }: Omit<aws_iam.RoleProps, 'assumedBy'>);
}
