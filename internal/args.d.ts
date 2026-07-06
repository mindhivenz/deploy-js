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
export declare const parseArgs: <T>(args: Argv<T>, { complete }?: IParseOpts) => { [key in keyof yargs.Arguments<T> as key | yargs.CamelCaseKey<key>]: yargs.Arguments<T>[key]; };
export {};
