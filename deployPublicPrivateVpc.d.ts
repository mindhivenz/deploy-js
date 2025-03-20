interface IOptions {
    proj: string;
    stage: string;
    region: string;
    azCount?: number;
    ipPrefix?: string;
}
declare const _default: ({ proj, stage, region, azCount, ipPrefix, }: IOptions) => NodeJS.ReadWriteStream;
export default _default;
