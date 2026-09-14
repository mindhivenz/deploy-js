"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const gulp_1 = require("gulp");
const p_limit_1 = __importDefault(require("p-limit"));
const prompts_1 = require("prompts");
const sortBy_1 = __importDefault(require("lodash/sortBy"));
const controlSecrets_1 = require("./controlSecrets");
const eyamlEncode_1 = __importDefault(require("./eyamlEncode"));
const eyamlDecode_1 = __importDefault(require("./eyamlDecode"));
const args_1 = require("./internal/args");
const colors_1 = require("./colors");
const secrets_1 = require("./secrets");
const DECRYPT_CONCURRENCY = 10;
const filterGroup = 'Filter options';
const filterArgs = () => args_1.globalArgs
    .option('customer', {
    alias: 'c',
    describe: 'Customer, eg jbs',
    type: 'string',
    group: filterGroup,
})
    .option('site', {
    alias: 's',
    describe: 'Site, eg cactus',
    type: 'string',
    group: filterGroup,
})
    .option('host', {
    describe: 'Host, eg display1',
    type: 'string',
    group: filterGroup,
})
    .option('key', {
    alias: 'k',
    describe: 'Hiera key, eg root_password',
    type: 'string',
    group: filterGroup,
})
    .option('file', {
    alias: 'f',
    describe: 'File path, eg jbs/cactus',
    type: 'string',
    group: filterGroup,
});
const filtersFrom = (args) => Object.fromEntries(controlSecrets_1.FILTER_NAMES.map((name) => [name, args[name]]));
const logRows = (rows, valueColor) => {
    const scopeWidth = Math.max(...rows.map(({ scope }) => scope.length));
    const keyWidth = Math.max(...rows.map(({ key }) => key.length));
    rows.forEach(({ scope, key, value }) => {
        (0, fancy_log_1.default)(`${(0, colors_1.highlight)(scope.padEnd(scopeWidth))}  ${key.padEnd(keyWidth)}  ${valueColor(value)}`);
    });
};
const selectSecret = async (secrets) => {
    const choices = (0, sortBy_1.default)(secrets.map((secret, value) => ({
        title: `${(0, controlSecrets_1.scopeName)(secret)}  ${secret.key}`,
        value,
    })), 'title');
    const answer = await (0, prompts_1.prompt)({
        type: 'autocomplete',
        name: 'index',
        message: 'Select secret to decrypt',
        choices,
    });
    return answer.index === undefined ? undefined : secrets[answer.index];
};
exports.default = (options) => {
    const { region } = options;
    (0, gulp_1.task)('encrypt:secret:control', async () => {
        const raw = await (0, secrets_1.readStdInSecretText)();
        const encoded = await (0, eyamlEncode_1.default)(raw, options);
        (0, fancy_log_1.default)('Token for use in eyaml:\n' + (0, colors_1.toCopy)(encoded));
    });
    (0, gulp_1.task)('decrypt:secret', async () => {
        const input = await (0, secrets_1.readStdInOrPromptText)({
            prompt: "Encoded secret (starts with 'ENC[')",
        });
        (0, fancy_log_1.default)('Decrypted secret:\n' + (0, colors_1.toCopy)(await (0, eyamlDecode_1.default)(input, { region })));
    });
    (0, gulp_1.task)('list:secrets:control', async () => {
        const filters = filtersFrom((0, args_1.parseArgs)(filterArgs()));
        const secrets = await (0, controlSecrets_1.findControlSecrets)(filters);
        logRows(secrets.map((secret) => ({
            scope: (0, controlSecrets_1.scopeName)(secret),
            key: secret.key,
            value: secret.file,
        })), colors_1.dim);
        (0, fancy_log_1.default)(`${secrets.length} encrypted secret(s)`);
    });
    (0, gulp_1.task)('decrypt:secret:control', async () => {
        const args = (0, args_1.parseArgs)(filterArgs().option('all', {
            describe: 'Decrypt every match instead of selecting one',
            type: 'boolean',
        }));
        const secrets = await (0, controlSecrets_1.findControlSecrets)(filtersFrom(args));
        let selected = secrets;
        if (secrets.length > 1 && !args.all) {
            const chosen = await selectSecret(secrets);
            if (!chosen) {
                return;
            }
            selected = [chosen];
        }
        const limit = (0, p_limit_1.default)(DECRYPT_CONCURRENCY);
        const rows = await Promise.all(selected.map((secret) => limit(async () => ({
            scope: (0, controlSecrets_1.scopeName)(secret),
            key: secret.key,
            value: await (0, eyamlDecode_1.default)(secret.cipher, { region }),
        }))));
        logRows(rows, colors_1.toCopy);
    });
};
