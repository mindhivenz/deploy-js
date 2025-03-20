import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface DatadogServerlessProps {
    logLevel?: 'INFO' | 'DEBUG';
    service?: string;
    env?: string;
}
export declare class DatadogServerlessMacro extends Construct {
    constructor(scope: Construct, id: string, props?: DatadogServerlessProps);
    monitorFunction(func: aws_lambda.Function): void;
}
export {};
