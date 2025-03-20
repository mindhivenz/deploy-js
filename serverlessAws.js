"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFactory = void 0;
const flatten_1 = __importDefault(require("lodash/flatten"));
const kebabCase_1 = __importDefault(require("lodash/kebabCase"));
const awsCredentialsEnv_1 = __importDefault(require("./awsCredentialsEnv"));
const execFile_1 = __importDefault(require("./execFile"));
const publicStageName_1 = __importDefault(require("./publicStageName"));
const serializeServerlessArgs = (args) => (0, flatten_1.default)(Object.entries(args).map(([k, v]) => {
    const arg = `--${(0, kebabCase_1.default)(k)}`;
    return v === true ? [arg] : [arg, v];
}));
const task = async ({ proj, stage, region, command, args = {}, env = process.env, ...options }) => {
    const credentialsEnv = await (0, awsCredentialsEnv_1.default)({ proj, stage, region });
    const { stdOut } = await (0, execFile_1.default)('serverless', [...command.split(/\s+/), ...serializeServerlessArgs(args)], {
        env: {
            ...env,
            ...credentialsEnv,
            STAGE_LOCAL: stage,
            STAGE_PUBLIC: (0, publicStageName_1.default)(stage),
        },
        ...options,
    });
    return stdOut;
};
const taskFactory = (fixedOptions) => (options) => task({
    ...fixedOptions,
    ...options,
});
exports.taskFactory = taskFactory;
exports.default = task;
