import { Credentials } from 'aws-sdk';
export interface IOptions {
    region?: string;
}
export declare const credentialsEnv: (credentials: Credentials, { region }?: IOptions) => Promise<{
    AWS_REGION?: string | undefined;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_SESSION_TOKEN: string;
    AWS_SECURITY_TOKEN: string;
}>;
