import { aws_ecr, aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface SiteImageRepositoryProps extends Omit<aws_ecr.RepositoryProps, 'lifecycleRules' | 'lifecycleRegistryId'> {
    tagResolver: aws_iam.IGrantable;
}
export declare class SiteImageRepository extends aws_ecr.Repository {
    constructor(scope: Construct, id: string, { tagResolver, ...props }: SiteImageRepositoryProps);
}
export {};
