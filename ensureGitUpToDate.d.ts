/// <reference types="lodash" />
interface IOptions {
    pluginName?: string;
}
declare const _default: ((repoPath?: string, { pluginName }?: IOptions) => Promise<string>) & import("lodash").MemoizedFunction;
export default _default;
