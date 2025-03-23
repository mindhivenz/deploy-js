import { Credentials } from 'aws-sdk';
import { IRegionalProjOptions } from './awsProjOptions';
export interface IServiceOpts {
    credentials: Credentials;
    region: string;
}
declare const _default: (options: IRegionalProjOptions) => IServiceOpts;
export default _default;
