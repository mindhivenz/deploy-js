import { IServiceOpts } from './awsServiceOptions';
interface ISyncOptions {
    serviceOpts: IServiceOpts;
    bucket: string;
    useAccelerateEndpoint?: boolean;
}
interface IPathPair {
    s3Path: string;
    cachePath: string;
}
interface IDirOptions extends IPathPair {
    purgeLocal: boolean;
}
declare const _default: ({ serviceOpts, bucket, useAccelerateEndpoint, }: ISyncOptions) => {
    file: (({ s3Path, cachePath }: IPathPair) => Promise<void>) & import("lodash").MemoizedFunction;
    dir: ({ s3Path, cachePath, purgeLocal }: IDirOptions) => Promise<void>;
};
export default _default;
