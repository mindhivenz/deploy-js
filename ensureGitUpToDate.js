"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const memoize_1 = __importDefault(require("lodash/memoize"));
const path = __importStar(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const fancy_log_1 = __importDefault(require("fancy-log"));
const execFile_1 = __importDefault(require("./execFile"));
const args_1 = require("./internal/args");
exports.default = (0, memoize_1.default)(async (repoPath = process.cwd(), { pluginName = '@mindhive/deploy/ensureGitUpToDate' } = {}) => {
    const { ignoreGit } = (0, args_1.parseArgs)(args_1.globalArgs, { complete: false });
    if (ignoreGit) {
        (0, fancy_log_1.default)('Ignoring git state');
        return 'Ignoring git state';
    }
    const options = { cwd: repoPath, captureOutput: true };
    // status needed sometimes to update git
    await (0, execFile_1.default)('git', ['status'], options);
    try {
        await (0, execFile_1.default)('git', ['diff-index', 'HEAD', '--quiet', '--exit-code'], options);
    }
    catch (e) {
        throw new plugin_error_1.default(pluginName, 'You have uncommitted changes or need to pull');
    }
    await (0, execFile_1.default)('git', ['remote', 'update'], options);
    const { stdOut: local } = await (0, execFile_1.default)('git', ['rev-parse', '@'], options);
    const { stdOut: remote } = await (0, execFile_1.default)('git', ['rev-parse', '@{u}'], options);
    if (local === remote) {
        return 'Up to date';
    }
    const { stdOut: base } = await (0, execFile_1.default)('git', ['merge-base', '@', '@{u}'], options);
    if (local === base) {
        throw new plugin_error_1.default(pluginName, 'You are behind origin: pull');
    }
    else if (remote === base) {
        (0, fancy_log_1.default)('Ahead of origin, need to push');
        return 'Ahead of origin, need to push';
    }
    else {
        throw new plugin_error_1.default(pluginName, 'You have diverged from origin: pull and merge');
    }
}, (repoPath) => (repoPath ? path.resolve(repoPath) : process.cwd()));
