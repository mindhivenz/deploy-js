import { IOptions as EyamlOptions } from './eyamlEncode';
interface IOptions extends EyamlOptions {
    customers: string[];
    stages?: string[];
}
declare const _default: ({ proj, region, customers, stages, }: IOptions) => void;
export default _default;
