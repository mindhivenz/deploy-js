import { IServiceOpts } from './awsServiceOptions';
import { IRegionalProjOptions } from './awsProjOptions';
interface IStackOps {
    stackVersion: 'v1' | 'v2';
    cloudSecurityPostureManagement?: boolean;
    externalId?: string;
}
interface IOpts extends IStackOps {
    serviceOpts: IServiceOpts;
}
interface ITaskOpts extends IRegionalProjOptions, IStackOps {
}
export declare const updateDatadogIntegration: ({ serviceOpts, stackVersion, cloudSecurityPostureManagement, externalId, }: IOpts) => Promise<void>;
declare const _default: ({ stackVersion, cloudSecurityPostureManagement, externalId, ...projOpts }: ITaskOpts) => () => Promise<void>;
export default _default;
