"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execFile_1 = __importDefault(require("./execFile"));
const yarnVersionBumpArgs_1 = require("./internal/yarnVersionBumpArgs");
exports.default = async ({ pipeOutput = false, packageDir }) => {
    await (0, execFile_1.default)('yarn', ['publish', '--non-interactive', ...(0, yarnVersionBumpArgs_1.yarnVersionBumpArgs)()], {
        cwd: packageDir,
        pipeOutput,
    });
};
