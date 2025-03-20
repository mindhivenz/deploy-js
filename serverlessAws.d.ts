import { IExecOpts } from './internal/execCommon';
declare type IServerlessArgs = Record<string, string | true>;
export interface IServerlessCommand extends IExecOpts {
    proj: string;
    stage: string;
    region?: string;
    command: string;
    args?: IServerlessArgs;
}
declare const task: ({ proj, stage, region, command, args, env, ...options }: IServerlessCommand) => Promise<string>;
declare type IFixedServerlessOptions = Pick<IServerlessCommand, 'proj' | 'stage' | 'region' | 'cwd'>;
declare type ICurriedServerlessOptions = Pick<IServerlessCommand, Exclude<keyof IServerlessCommand, keyof IFixedServerlessOptions>>;
export declare const taskFactory: (fixedOptions: IFixedServerlessOptions) => (options: ICurriedServerlessOptions) => Promise<string>;
export default task;
