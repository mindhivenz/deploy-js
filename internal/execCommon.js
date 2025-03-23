"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCommand = void 0;
const child_process_1 = require("child_process");
const fancy_log_1 = __importDefault(require("fancy-log"));
const find_up_1 = __importDefault(require("find-up"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const shell_escape_1 = __importDefault(require("shell-escape"));
const args_1 = require("./args");
const colors_1 = require("../colors");
const nodeModulesBinDirs = async (cwd) => {
    const paths = [];
    let currentDir = cwd;
    do {
        const nodeModules = await (0, find_up_1.default)('node_modules', {
            cwd: currentDir,
            type: 'directory',
        });
        if (!nodeModules) {
            break;
        }
        paths.push(path_1.default.join(nodeModules, '.bin'));
        currentDir = path_1.default.dirname(path_1.default.dirname(nodeModules));
    } while (currentDir !== '/');
    return paths;
};
const execCommand = async ({ shell, pluginName }, command, args, { cwd = process.cwd(), env: passedEnv = process.env, pipeInput = false, captureOutput = false, pipeOutput, okExitCodes = [0], } = {}) => {
    const argv = (0, args_1.parseArgs)(args_1.globalArgs, { complete: false });
    if (pipeOutput === undefined) {
        pipeOutput = !!argv.verbose;
    }
    const binDirs = await nodeModulesBinDirs(String(cwd));
    const env = { ...passedEnv };
    env.PATH = [...binDirs, ...(env.PATH ? [env.PATH] : [])].join(path_1.default.delimiter);
    const commandDescription = () => (0, colors_1.commandLine)((0, shell_escape_1.default)([command, ...args]));
    if (argv.verbose) {
        (0, fancy_log_1.default)(`${(0, colors_1.dim)(`${cwd}`)}: ${commandDescription()}`);
    }
    return await new Promise((resolve, reject) => {
        const stdOutBuffers = [];
        const stdErrBuffers = [];
        let rejected = false;
        const concatBuffers = (buffers) => Buffer.concat(buffers).toString().trim();
        const rejectWith = (err) => {
            if (rejected) {
                return;
            }
            (0, fancy_log_1.default)(`${(0, colors_1.error)('Errored:')} ${commandDescription()}`);
            if (!pipeOutput) {
                const stdOut = concatBuffers(stdOutBuffers);
                const stdErr = concatBuffers(stdErrBuffers);
                if (stdOut) {
                    (0, fancy_log_1.default)(`${(0, colors_1.dim)('-- stdout --')}\n${stdOut}`);
                }
                if (stdErr) {
                    (0, fancy_log_1.default)(`${(0, colors_1.dim)('-- stderr --')}\n${stdErr}`);
                }
            }
            const message = typeof err === 'string'
                ? err
                : err.message || 'spawn failed without message';
            reject(new plugin_error_1.default(pluginName, message));
            rejected = true;
        };
        const subProcess = (0, child_process_1.spawn)(command, args, {
            cwd,
            env,
            shell,
            stdio: [
                pipeInput ? 'inherit' : 'ignore',
                !captureOutput && pipeOutput ? 'inherit' : 'pipe',
                pipeOutput ? 'inherit' : 'pipe',
            ],
        })
            .on('error', (e) => {
            if (!pipeOutput) {
                if (subProcess.stdout) {
                    subProcess.stdout.destroy();
                }
                if (subProcess.stderr) {
                    subProcess.stderr.destroy();
                }
            }
            if (e.code === 'ENOENT') {
                (0, fancy_log_1.default)(`PATH=${env.PATH}`);
                rejectWith(`Couldn't find "${command}" to execute or current directory (cwd) "${cwd}" is not valid`);
            }
            else {
                rejectWith(e);
            }
        })
            .on('close', (code, signal) => {
            if (signal) {
                rejectWith(`Exited with signal ${signal}`);
            }
            else if (code && !okExitCodes.includes(code)) {
                rejectWith(`Exited with code ${code}`);
            }
            else {
                resolve({
                    stdOut: captureOutput ? concatBuffers(stdOutBuffers) : '',
                    stdErr: captureOutput ? concatBuffers(stdErrBuffers) : '',
                    exitCode: code,
                });
            }
        });
        if ((captureOutput || !pipeOutput) && subProcess.stdout) {
            subProcess.stdout.on('data', (chunk) => {
                if (pipeOutput) {
                    process.stdout.write(chunk);
                }
                stdOutBuffers.push(chunk);
            });
        }
        if (!pipeOutput && subProcess.stderr) {
            subProcess.stderr.on('data', (chunk) => {
                stdErrBuffers.push(chunk);
            });
        }
    });
};
exports.execCommand = execCommand;
