export interface IOptions {
    proj: string;
    region: string;
}
declare const _default: (secret: string, { proj, region }: IOptions) => Promise<string>;
export default _default;
