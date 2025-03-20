"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStdInSecretJson = exports.readStdInSecretText = exports.readStdInOrPromptText = exports.setSecretJson = exports.setSecretText = exports.getSecretJson = exports.getSecretText = exports.allStages = void 0;
const get_stdin_1 = __importDefault(require("get-stdin"));
const once_1 = __importDefault(require("lodash/once"));
const nodecredstash_1 = __importDefault(require("nodecredstash"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const prompts_1 = require("prompts");
const awsMasterCredentials_1 = require("./internal/awsMasterCredentials");
const publicStageName_1 = __importDefault(require("./publicStageName"));
exports.allStages = 'all';
const secretStash = (0, once_1.default)(() => (0, nodecredstash_1.default)({
    awsOpts: {
        credentials: awsMasterCredentials_1.master,
        region: 'us-east-1',
    },
    kmsKey: 'alias/deploy-secrets',
    table: 'deploy-secrets',
}));
const secretStageName = (stage) => stage ? (0, publicStageName_1.default)(stage) : exports.allStages;
const secretFqn = ({ name, proj, stage }) => [proj, secretStageName(stage), name].join('.');
const secretContext = ({ proj, stage }) => ({
    proj,
    stage: secretStageName(stage),
});
const secretsPluginName = '@mindhive/deploy/secrets';
const getSecretText = async (ref) => {
    const name = secretFqn(ref);
    try {
        return await secretStash().getSecret({
            context: secretContext(ref),
            name,
        });
    }
    catch (e) {
        throw new plugin_error_1.default(secretsPluginName, `Unable to get secret ${name}, have you been granted access to secrets for this project/stage?\n${e}`);
    }
};
exports.getSecretText = getSecretText;
const getSecretJson = async (ref) => JSON.parse(await (0, exports.getSecretText)(ref));
exports.getSecretJson = getSecretJson;
const setSecretText = async (ref, secret) => {
    const name = secretFqn(ref);
    const currentVersion = await secretStash().getHighestVersion({ name });
    try {
        if (currentVersion) {
            const existingSecret = await await secretStash().getSecret({
                context: secretContext(ref),
                name,
            });
            if (existingSecret === secret) {
                return;
            }
        }
        await secretStash().putSecret({
            context: secretContext(ref),
            name,
            secret,
            version: (await secretStash().incrementVersion({
                name,
            })),
        });
    }
    catch (e) {
        throw new plugin_error_1.default(secretsPluginName, `Unable to set secret ${name}, have you been granted access to secrets for this project/stage?\n${e}`);
    }
};
exports.setSecretText = setSecretText;
const setSecretJson = async (ref, secretObj) => {
    await (0, exports.setSecretText)(ref, JSON.stringify(secretObj));
};
exports.setSecretJson = setSecretJson;
const readStdInOrPromptText = async ({ prompt: message, }) => {
    const raw = await (0, get_stdin_1.default)();
    if (raw) {
        return raw.trim();
    }
    const answer = await (0, prompts_1.prompt)({
        type: 'text',
        name: 'raw',
        message,
    });
    return answer.raw;
};
exports.readStdInOrPromptText = readStdInOrPromptText;
const readStdInSecretText = async () => {
    const raw = await (0, get_stdin_1.default)();
    if (raw) {
        return raw.trim();
    }
    const answer = await (0, prompts_1.prompt)({
        type: 'password',
        name: 'raw',
        message: 'Type/paste secret',
    });
    return answer.raw;
};
exports.readStdInSecretText = readStdInSecretText;
const readStdInSecretJson = async () => {
    const raw = await (0, get_stdin_1.default)();
    return JSON.parse(raw);
};
exports.readStdInSecretJson = readStdInSecretJson;
