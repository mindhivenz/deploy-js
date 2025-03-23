"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_error_1 = __importDefault(require("plugin-error"));
const execFile_1 = __importDefault(require("./execFile"));
const pluginName = '@mindhive/deploy/ensureBranch';
exports.default = async (requiredBranch, repoPath) => {
    const { stdOut: actualBranch } = await (0, execFile_1.default)('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoPath, captureOutput: true });
    if (requiredBranch !== actualBranch) {
        throw new plugin_error_1.default(pluginName, `You are on ${actualBranch}, not ${requiredBranch}`);
    }
};
