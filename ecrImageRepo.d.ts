import { IRepoHostOptions } from './internal/ecr';
interface IOptions extends IRepoHostOptions {
    name: string;
}
declare const _default: (options: IOptions) => Promise<string>;
export default _default;
