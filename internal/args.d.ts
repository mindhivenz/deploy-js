import yargs, { Argv } from 'yargs';
export declare const globalArgs: yargs.Argv<{
    verbose: boolean | undefined;
} & {
    devName: string | undefined;
} & {
    "ignore-git": boolean | undefined;
}>;
interface IParseOpts {
    complete?: boolean;
}
export declare const parseArgs: <T>(args: yargs.Argv<T>, { complete }?: IParseOpts) => yargs.Arguments<T> extends infer T_1 ? { [key in keyof T_1 as key | yargs.CamelCaseKey<key>]: yargs.Arguments<T>[key]; } : never;
export {};
