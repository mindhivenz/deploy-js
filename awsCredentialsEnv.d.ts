import { IProjOptions } from './awsProjOptions';
export interface IAwsCredentialsEnvOptions extends IProjOptions {
    region?: string;
}
declare const _default: ({ region, ...projOptions }: IAwsCredentialsEnvOptions) => Promise<{
    AWS_REGION?: string | undefined;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_SESSION_TOKEN: string;
    AWS_SECURITY_TOKEN: string;
}>;
export default _default;
