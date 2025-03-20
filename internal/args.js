"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = exports.globalArgs = void 0;
const yargs_1 = __importDefault(require("yargs"));
const ARGS_ENV_VAR = 'MHD_ARGS';
const ARG_SEPARATOR = '\t';
const group = 'Global options';
exports.globalArgs = yargs_1.default
    .version(false)
    .option('verbose', {
    describe: 'Stream all sub-process output to console',
    group,
    boolean: true,
})
    .option('devName', {
    describe: "Override your 'dev' name",
    group,
    defaultDescription: 'your git username',
    string: true,
})
    .option('ignore-git', { describe: 'Ignore git remote', group, boolean: true });
const parseArgs = (args, { complete = true } = {}) => {
    if (ARGS_ENV_VAR in process.env) {
        const argsEnvValue = process.env[ARGS_ENV_VAR];
        const argsEnv = argsEnvValue ? argsEnvValue.split(ARG_SEPARATOR) : [];
        return args.strict(complete).parseSync(argsEnv);
    }
    else {
        const argsProcess = process.argv.slice(2);
        return args.strict(false).parseSync(argsProcess);
    }
};
exports.parseArgs = parseArgs;
