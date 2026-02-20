import { IServiceOpts } from './awsServiceOptions';
import { IRegionalProjOptions } from './awsProjOptions';
interface IStackOps {
    stackName?: string;
    cloudSecurityPostureManagement?: boolean;
    externalId?: string;
}
interface IOpts extends IStackOps {
    serviceOpts: IServiceOpts;
}
interface ITaskOpts extends IRegionalProjOptions, IStackOps {
}
export declare const updateDatadogIntegration: ({ serviceOpts, stackName, cloudSecurityPostureManagement, externalId, }: IOpts) => Promise<void>;
declare const _default: ({ stackName, cloudSecurityPostureManagement, externalId, ...projOpts }: ITaskOpts) => () => Promise<void>;
export default _default;
