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
            pluginName: '@mindhivenz/deploy/gitHash',
        });
    }
    const { stdOut: hashOut } = await (0, execFile_1.default)('git', ['rev-parse', '--short', 'HEAD'], {
        cwd: repoPath,
        captureOutput: true,
    });
    const parts = ['git', hashOut.trim()];
    return parts.join('-');
};
