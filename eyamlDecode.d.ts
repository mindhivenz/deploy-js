export declare const ENC_PATTERN: RegExp;
export interface IOptions {
    region: string;
}
declare const _default: (encoded: string, { region }: IOptions) => Promise<string>;
export default _default;
