/// <reference types="lodash" />
interface IOptions {
    gitTag?: boolean;
    gitUpToDate?: boolean;
}
declare const _default: ((packageJsonPath?: string, { gitTag, gitUpToDate }?: IOptions) => Promise<string>) & import("lodash").MemoizedFunction;
export default _default;
