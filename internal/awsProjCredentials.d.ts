import AWS from 'aws-sdk';
import './awsConfig';
import { IProjOptions } from '../awsProjOptions';
export declare class ProjCredentials extends AWS.ChainableTemporaryCredentials {
    private readonly projOptions;
    constructor(projOptions: IProjOptions);
    refresh(callback: (err: AWS.AWSError) => void): void;
    private _resolveRoleArn;
}
export declare const projCredentialsFactory: (options: IProjOptions) => AWS.Credentials;
