import { IServiceOpts } from './awsServiceOptions';
import { IRegionalProjOptions } from './awsProjOptions';
interface IStackOps {
    stackName?: string;
    cloudSecurityPostureManagement?: boolean;
}
interface IOpts extends IStackOps {
    serviceOpts: IServiceOpts;
}
interface ITaskOpts extends IRegionalProjOptions, IStackOps {
}
export declare const updateDatadogIntegration: ({ serviceOpts, cloudSecurityPostureManagement, stackName, }: IOpts) => Promise<void>;
declare const _default: ({ stackName, cloudSecurityPostureManagement, ...projOpts }: ITaskOpts) => () => Promise<void>;
export default _default;
