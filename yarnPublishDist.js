"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const path_1 = __importDefault(require("path"));
const stream_to_promise_1 = __importDefault(require("stream-to-promise"));
const execFile_1 = __importDefault(require("./execFile"));
const yarnVersionBumpArgs_1 = require("./internal/yarnVersionBumpArgs");
exports.default = async ({ pipeOutput = false, srcPackageDir, distPackageDir, }) => {
    const versionBumpArgs = (0, yarnVersionBumpArgs_1.yarnVersionBumpArgs)();
    if (versionBumpArgs.length) {
        await (0, execFile_1.default)('yarn', ['version', '--non-interactive', ...versionBumpArgs], {
            cwd: srcPackageDir,
            pipeOutput,
        });
    }
    await (0, stream_to_promise_1.default)((0, gulp_1.src)(path_1.default.join(srcPackageDir, 'package.json'), { buffer: false }).pipe((0, gulp_1.dest)(distPackageDir)));
    await (0, execFile_1.default)('yarn', ['publish', '--non-interactive'], {
        cwd: distPackageDir,
        pipeOutput,
    });
};
