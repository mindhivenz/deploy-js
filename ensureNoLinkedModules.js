"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const plugin_error_1 = __importDefault(require("plugin-error"));
const util_1 = require("util");
// REVISIT: linked modules OK if linked from same Git tree
// REVISIT: should check that file: linked packages are in the same Git tree
const pluginName = '@mindhivenz/deploy/ensureNoLinkedModules';
const readdirAsync = (0, util_1.promisify)(fs_1.readdir);
const lstatAsync = (0, util_1.promisify)(fs_1.lstat);
const checkDir = async (dirPath) => {
    const filenames = await readdirAsync(dirPath);
    await Promise.all([
        ...filenames.map(async (f) => {
            const filePath = (0, path_1.join)(dirPath, f);
            const stat = await lstatAsync(filePath);
            if (stat.isSymbolicLink()) {
                throw new plugin_error_1.default(pluginName, `You have linked node_module: ${filePath}`);
            }
        }),
        ...filenames
            .filter((f) => f.startsWith('@'))
            .map((f) => checkDir((0, path_1.join)(dirPath, f))),
    ]);
};
exports.default = async (path) => {
    await checkDir((0, path_1.join)(path, 'node_modules'));
};
