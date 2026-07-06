import AWS from 'aws-sdk';
import { IProjOptions } from '../awsProjOptions';
import './awsConfig';
export declare class ProjCredentials extends AWS.ChainableTemporaryCredentials {
    private readonly projOptions;
    constructor(projOptions: IProjOptions);
    refresh(callback: (err: AWS.AWSError) => void): void;
    private _resolveRoleArn;
}
declare const credentialsFactory: (options: IProjOptions) => AWS.Credentials;
export declare const projCredentialsFactory: typeof credentialsFactory;
export {};
