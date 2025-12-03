"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const colors_1 = require("./colors");
exports.default = (path, { taskNameToCreate, pluginName = '@mindhivenz/deploy' } = {}) => {
    try {
        return fs_1.default.readFileSync(path, 'utf8').trim();
    }
    catch (e) {
        if (taskNameToCreate && e.code === 'ENOENT') {
            const shortPath = path.startsWith(process.cwd())
                ? path.substring(process.cwd().length + 1)
                : path;
            throw new plugin_error_1.default(pluginName, `First run task ${(0, colors_1.task)(taskNameToCreate)} to create ${(0, colors_1.highlight)(shortPath)}`, { showProperties: false });
        }
        throw e;
    }
};
