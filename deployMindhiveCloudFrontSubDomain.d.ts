interface IOptions {
    domainName: string;
    cloudFrontDomainName: string;
    stackName?: string;
}
declare const _default: ({ domainName, cloudFrontDomainName, stackName, }: IOptions) => import("stream").Transform;
export default _default;
