interface IOptions {
    srcPackageDir: string;
    distPackageDir: string;
    pipeOutput?: boolean;
}
declare const _default: ({ pipeOutput, srcPackageDir, distPackageDir, }: IOptions) => Promise<void>;
export default _default;
