"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const plugin_error_1 = __importDefault(require("plugin-error"));
const ensureNoLinkedModules_1 = __importDefault(require("./ensureNoLinkedModules"));
const pluginName = '@mindhivenz/deploy/ensureNodeModulesDeterministic';
exports.default = async (path) => {
    const checkYarnIntegrity = () => new Promise((resolve, reject) => {
        (0, child_process_1.execFile)('yarn', ['check', '--integrity', '--verify-tree'], { cwd: path }, (error, stdout, stderr) => {
            if (error) {
                reject(new plugin_error_1.default(pluginName, `Yarn integrity check failed:\n${stderr}`));
            }
            else {
                resolve(undefined);
            }
        });
    });
    await Promise.all([(0, ensureNoLinkedModules_1.default)(path), checkYarnIntegrity()]);
};
