"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssmInteractiveCommand = void 0;
const awsCredentialsEnv_1 = __importDefault(require("../awsCredentialsEnv"));
const execFile_1 = __importDefault(require("../execFile"));
const ssmInteractiveCommand = async (projOptions, instanceId, command) => {
    const awsEnv = await (0, awsCredentialsEnv_1.default)({
        fullDurationSession: true,
        ...projOptions,
    });
    process.stdin.setRawMode(true);
    const sigIntHandler = () => {
        // Ignore it so we don't quit if ctrl-c in shell
    };
    process.on('SIGINT', sigIntHandler);
    try {
        await (0, execFile_1.default)('aws', [
            'ssm',
            'start-session',
            ...['--target', instanceId],
            // REVISIT: an alternative is to use the new ShellProfile of SSM-SessionManagerRunShell in agent 3.0
            ...['--document-name', 'AWS-StartInteractiveCommand'],
            ...['--parameters', `command="${command}"`],
        ], {
            env: {
                ...process.env,
                ...awsEnv,
            },
            pipeInput: true,
            pipeOutput: true,
        });
    }
    finally {
        process.off('SIGINT', sigIntHandler);
    }
};
exports.ssmInteractiveCommand = ssmInteractiveCommand;
