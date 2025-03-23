import { IServiceOpts } from './awsServiceOptions';
import { IRegionalProjOptions } from './awsProjOptions';
interface IOpts {
    serviceOpts: IServiceOpts;
    cloudSecurityPostureManagement?: boolean;
}
interface ITaskOpts extends IRegionalProjOptions {
    cloudSecurityPostureManagement?: boolean;
}
export declare const updateDatadogIntegration: ({ serviceOpts, cloudSecurityPostureManagement, }: IOpts) => Promise<void>;
declare const _default: ({ cloudSecurityPostureManagement, ...projOpts }: ITaskOpts) => () => Promise<void>;
export default _default;
