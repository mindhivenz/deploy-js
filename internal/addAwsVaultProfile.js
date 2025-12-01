"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const colors_1 = require("../colors");
const awsVaultProfile_1 = require("./awsVaultProfile");
const awsConfigFilePath = () => path_1.default.join(os_1.default.homedir(), '.aws', 'config');
const existingConfigContent = () => {
    const configPath = awsConfigFilePath();
    try {
        return fs_1.default.readFileSync(configPath, 'utf8');
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            throw new plugin_error_1.default('addAwsVaultProfile', `It appears you don't have AWS credentials setup. No existing aws config at: ${configPath}`, { showProperties: false });
        }
        else {
            throw e;
        }
    }
};
exports.default = (options) => async () => {
    (0, fancy_log_1.default)(`Adding profile for ${options.profileName}`);
    const { profileName, header, iniProfile } = await (0, awsVaultProfile_1.awsVaultProfile)(options);
    const config = existingConfigContent();
    if (config.includes(header)) {
        (0, fancy_log_1.default)([
            `You already have a profile called ${(0, colors_1.highlight)(profileName)}.`,
            "I won't go changing your config. You can do it manually.",
            `This is what you need in ${(0, colors_1.highlight)(awsConfigFilePath())}:`,
            (0, colors_1.toCopy)(iniProfile),
        ].join('\n'));
        return;
    }
    const separator = config.endsWith('\n\n') ? '' : '\n';
    fs_1.default.appendFileSync(awsConfigFilePath(), `${separator}${iniProfile}\n`);
    (0, fancy_log_1.default)([
        `Profile created. Now you can: ${(0, colors_1.commandLine)(`aws-vault exec ${profileName} -- ...`)}`,
        `Note: if you are restricted to a certain role you need to change the role name in ${(0, colors_1.highlight)(awsConfigFilePath())}`,
    ].join('\n'));
};
