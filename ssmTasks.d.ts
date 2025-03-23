import { IOptions as EyamlOptions } from './eyamlEncode';
interface IOptions extends EyamlOptions {
    customers: string[];
}
declare const _default: ({ proj, region, customers }: IOptions) => void;
export default _default;
