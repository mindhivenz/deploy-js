import { IServiceOpts } from './awsServiceOptions';
import { IRegionalProjOptions } from './awsProjOptions';
interface IStackOps {
    stackName?: string;
    cloudSecurityPostureManagement?: boolean;
    externalId?: string;
    ddApiKeyTextDoNotCommit?: string;
    ddApiKeySecretArn?: string;
}
interface IOpts extends IStackOps {
    serviceOpts: IServiceOpts;
}
interface ITaskOpts extends IRegionalProjOptions, IStackOps {
}
export declare const updateDatadogIntegration: ({ serviceOpts, stackName, cloudSecurityPostureManagement, externalId, ddApiKeyTextDoNotCommit, ddApiKeySecretArn, }: IOpts) => Promise<void>;
declare const _default: ({ stackName, cloudSecurityPostureManagement, externalId, ddApiKeySecretArn, ddApiKeyTextDoNotCommit, ...projOpts }: ITaskOpts) => () => Promise<void>;
export default _default;
