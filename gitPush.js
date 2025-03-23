"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const execFile_1 = __importDefault(require("./execFile"));
const args_1 = require("./internal/args");
exports.default = async (repoPath, remote = 'origin') => {
    const { ignoreGit } = (0, args_1.parseArgs)(args_1.globalArgs, { complete: false });
    if (ignoreGit) {
        (0, fancy_log_1.default)('Not pushing');
        return;
    }
    await (0, execFile_1.default)('git', ['push', '--follow-tags', remote], {
        cwd: repoPath,
    });
};
