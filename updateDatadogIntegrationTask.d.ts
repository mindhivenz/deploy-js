import { IServiceOpts } from './awsServiceOptions';
import { IRegionalProjOptions } from './awsProjOptions';
interface IStackOps {
    stackVersion: 'v1' | 'v2';
    cloudSecurityPostureManagement?: boolean;
}
interface IOpts extends IStackOps {
    serviceOpts: IServiceOpts;
}
interface ITaskOpts extends IRegionalProjOptions, IStackOps {
}
export declare const updateDatadogIntegration: ({ serviceOpts, cloudSecurityPostureManagement, stackVersion, }: IOpts) => Promise<void>;
declare const _default: ({ stackVersion, cloudSecurityPostureManagement, ...projOpts }: ITaskOpts) => () => Promise<void>;
export default _default;
