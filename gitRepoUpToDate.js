"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const execFile_1 = __importDefault(require("./execFile"));
exports.default = async (url, localDir, { shallow = false } = {}) => {
    try {
        await fs_1.default.promises.access(path_1.default.join(localDir, '.git'), fs_1.default.constants.W_OK);
        await (0, execFile_1.default)('git', ['pull'], { cwd: localDir });
    }
    catch {
        const options = [];
        if (shallow) {
            options.push('--depth=1');
        }
        await (0, execFile_1.default)('git', ['clone', ...options, url, localDir]);
    }
};
