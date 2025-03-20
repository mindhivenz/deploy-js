export interface IRepoHostOptions {
    proj: string;
    region: string;
    stage: string;
}
export declare const repoHost: (options: IRepoHostOptions) => Promise<string>;
