interface IResult {
    profileName: string;
    header: string;
    iniProfile: string;
}
export interface IOptions {
    proj: string;
    stage: string;
    region?: string;
    roleName: string;
    devName?: string;
    profileName?: string;
}
export declare const awsVaultProfile: ({ proj, stage, region, roleName, devName, profileName, }: IOptions) => Promise<IResult>;
export {};
