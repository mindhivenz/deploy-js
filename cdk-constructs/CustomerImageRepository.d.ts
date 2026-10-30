import { aws_ecr, aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface CustomerImageRepositoryProps extends Omit<aws_ecr.RepositoryProps, 'lifecycleRules' | 'lifecycleRegistryId'> {
    tagResolver: aws_iam.IGrantable;
}
export declare class CustomerImageRepository extends aws_ecr.Repository {
    constructor(scope: Construct, id: string, { tagResolver, ...props }: CustomerImageRepositoryProps);
}
export {};
