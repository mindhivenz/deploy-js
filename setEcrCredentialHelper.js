"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const execFile_1 = __importDefault(require("./execFile"));
const ecr_1 = require("./internal/ecr");
const CRED_HELPER = 'ecr-login';
const checkCredentialHelperInstalled = async () => {
    try {
        await (0, execFile_1.default)(`docker-credential-${CRED_HELPER}`, ['-v']);
    }
    catch (e) {
        throw new plugin_error_1.default('setEcrCredentialHelper', 'You need to install https://github.com/awslabs/amazon-ecr-credential-helper');
    }
};
exports.default = async (options) => {
    const host = await (0, ecr_1.repoHost)(options);
    const configPath = path_1.default.join(os_1.default.homedir(), '.docker', 'config.json');
    let originalRaw = null;
    try {
        originalRaw = (await fs_1.promises.readFile(configPath, {
            encoding: 'utf-8',
        }));
    }
    catch (e) {
        fancy_log_1.default.info(`No existing ${configPath}, will create one...`);
    }
    let config;
    if (originalRaw) {
        config = JSON.parse(originalRaw);
        const currentHelper = config.credHelpers?.[host];
        if (currentHelper === CRED_HELPER) {
            return;
        }
        else if (currentHelper) {
            throw new plugin_error_1.default('setEcrCredentialHelper', `Unexpected existing credHelpers.${host}: ${currentHelper}, wanted: ${CRED_HELPER}`);
        }
    }
    else {
        config = {};
    }
    await checkCredentialHelperInstalled();
    if (!config.credHelpers) {
        config.credHelpers = {};
    }
    config.credHelpers[host] = CRED_HELPER;
    await fs_1.promises.writeFile(configPath, JSON.stringify(config, null, '\t'), {
        encoding: 'utf-8',
        mode: 0o600,
    });
};
