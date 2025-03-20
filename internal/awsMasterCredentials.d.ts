import AWS from 'aws-sdk';
export declare const master: AWS.EnvironmentCredentials;
export declare const masterIsRole: () => Promise<boolean>;
