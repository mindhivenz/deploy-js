"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const memoize_1 = __importDefault(require("lodash/memoize"));
const ensureGitUpToDate_1 = __importDefault(require("./ensureGitUpToDate"));
const execFile_1 = __importDefault(require("./execFile"));
const colors_1 = require("./colors");
const yarnVersionBumpArgs_1 = require("./internal/yarnVersionBumpArgs");
const readJson_1 = __importDefault(require("./readJson"));
const pluginName = '@mindhivenz/deploy/bumpVersion';
const defaultPackagePath = './package.json';
const bumpVersion = async (packageJsonPath = defaultPackagePath, { gitTag = true, gitUpToDate = true } = {}) => {
    const readPackageVersion = () => {
        try {
            const pkg = (0, readJson_1.default)(packageJsonPath, { pluginName });
            return pkg.version;
        }
        catch (e) {
            throw new plugin_error_1.default(pluginName, `Failed to read ${packageJsonPath}: ${e}`);
        }
    };
    const repoPath = path_1.default.dirname(packageJsonPath);
    if (gitUpToDate) {
        await (0, ensureGitUpToDate_1.default)(repoPath, { pluginName });
    }
    const yarnArgs = (0, yarnVersionBumpArgs_1.yarnVersionBumpArgs)();
    const sameVersion = !yarnArgs.length;
    if (sameVersion) {
        return readPackageVersion();
    }
    if (!gitTag) {
        yarnArgs.push('--no-git-tag-version');
    }
    await (0, execFile_1.default)('yarn', ['version', ...yarnArgs], {
        cwd: repoPath,
    });
    const newVersion = readPackageVersion();
    (0, fancy_log_1.default)(`Version bumped to: ${(0, colors_1.highlight)(newVersion)}`);
    return newVersion;
};
// If multiple tasks call this only bump once
exports.default = (0, memoize_1.default)(bumpVersion, (packageJsonPath = defaultPackagePath) => path_1.default.normalize(path_1.default.resolve(packageJsonPath)));
