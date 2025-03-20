import { IRegionalProjOptions } from './awsProjOptions';
interface IOpts extends IRegionalProjOptions {
    stackName?: string;
}
declare const _default: <T extends string>(names: T[], { stackName, ...serviceOpts }: IOpts) => Promise<Record<T, string>>;
export default _default;
