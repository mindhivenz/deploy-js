interface IOptions {
    gitUpToDate?: boolean;
}
declare const _default: (repoPath?: string, { gitUpToDate }?: IOptions) => Promise<string>;
export default _default;
