"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const once_1 = __importDefault(require("lodash/once"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const shelljs_1 = __importDefault(require("shelljs"));
const camelCase_1 = __importDefault(require("lodash/camelCase"));
const args_1 = require("./internal/args");
const colors_1 = require("./colors");
const gitUserName = (0, once_1.default)(() => {
    if (process.env.CI) {
        return 'ci';
    }
    const execResult = shelljs_1.default.exec('git config user.name', {
        silent: true,
    });
    const name = (0, camelCase_1.default)(execResult.stdout);
    if (!name) {
        throw new plugin_error_1.default('@mindhivenz/deploy/devName', `You need to set your git username. Such as: ${(0, colors_1.commandLine)('git config --global user.name "John Doe"')}`);
    }
    return name;
});
exports.default = () => (0, args_1.parseArgs)(args_1.globalArgs, { complete: false }).devName || gitUserName();
