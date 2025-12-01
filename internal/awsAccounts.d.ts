import AWS from 'aws-sdk';
interface IOptions {
    proj: string;
    stage: string;
    devName?: string;
}
export declare const devsOwnAccountName: (name: string) => string;
export declare const resolveAccount: (options: IOptions) => Promise<AWS.Organizations.Account>;
export declare const accessTargetRoleName = "ops";
export declare const accessTargetRoleArn: (accountId: string, roleName: string) => string;
interface ISessionNameOptions {
    accountName: string;
    devName?: string;
    roleName?: string;
}
export declare const accessRoleSessionName: ({ accountName, devName, roleName, }: ISessionNameOptions) => string;
export {};
