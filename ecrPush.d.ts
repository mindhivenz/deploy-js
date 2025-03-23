import { IRepoHostOptions } from './internal/ecr';
interface IOptions extends IRepoHostOptions {
    localImageTag: string;
    repoName: string;
    remoteImageTag?: string;
    tagWithGitHash?: boolean;
    gitRepoPath?: string;
    pushLatest?: boolean;
    dryRun?: boolean;
}
declare const _default: ({ localImageTag, repoName, remoteImageTag, tagWithGitHash, gitRepoPath, pushLatest, dryRun, ...repoHostOptions }: IOptions) => Promise<void>;
export default _default;
