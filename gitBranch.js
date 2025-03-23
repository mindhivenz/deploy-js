"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ensureGitUpToDate_1 = __importDefault(require("./ensureGitUpToDate"));
const execFile_1 = __importDefault(require("./execFile"));
exports.default = async (repoPath, { gitUpToDate = false } = {}) => {
    if (gitUpToDate) {
        await (0, ensureGitUpToDate_1.default)(repoPath, {
            pluginName: '@mindhive/deploy/gitBranch',
        });
    }
    const { stdOut: branchOut } = await (0, execFile_1.default)('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        cwd: repoPath,
        captureOutput: true,
    });
    return branchOut.trim();
};
