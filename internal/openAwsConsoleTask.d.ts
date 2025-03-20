/// <reference types="node" />
import { URL } from 'url';
interface IOptions {
    proj: string;
    stage: string;
    region: string;
    urlParts?: Partial<URL>;
}
declare const _default: ({ proj, stage, region, urlParts }: IOptions) => () => Promise<void>;
export default _default;
