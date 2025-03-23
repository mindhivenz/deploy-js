/// <reference types="node" />
import { SpawnOptions } from 'child_process';
export interface IExecOpts extends Pick<SpawnOptions, 'cwd' | 'env'> {
    pipeInput?: boolean;
    captureOutput?: boolean;
    pipeOutput?: boolean;
    okExitCodes?: number[];
}
export interface IExecResult {
    stdOut: string;
    stdErr: string;
    exitCode: number | null;
}
interface IInternalExecOpts {
    shell: boolean;
    pluginName: string;
}
export declare const execCommand: ({ shell, pluginName }: IInternalExecOpts, command: string, args: Readonly<string[]>, { cwd, env: passedEnv, pipeInput, captureOutput, pipeOutput, okExitCodes, }?: IExecOpts) => Promise<IExecResult>;
export {};
