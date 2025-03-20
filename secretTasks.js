"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const fancy_log_1 = __importDefault(require("fancy-log"));
const gulp_1 = require("gulp");
const plugin_error_1 = __importDefault(require("plugin-error"));
const eyamlEncode_1 = __importDefault(require("./eyamlEncode"));
const awsMasterCredentials_1 = require("./internal/awsMasterCredentials");
const colors_1 = require("./colors");
const secrets_1 = require("./secrets");
exports.default = (options) => {
    (0, gulp_1.task)('encrypt:secret:control', async () => {
        const raw = await (0, secrets_1.readStdInSecretText)();
        const encoded = await (0, eyamlEncode_1.default)(raw, options);
        (0, fancy_log_1.default)('Token for use in eyaml:\n' + (0, colors_1.toCopy)(encoded));
    });
    (0, gulp_1.task)('decrypt:secret', async () => {
        let input = await (0, secrets_1.readStdInOrPromptText)({
            prompt: "Encoded secret (starts with 'ENC[')",
        });
        if (input.startsWith('ENC[')) {
            const match = input.match(/^ENC\[KMS,(.*)]$/);
            if (!match || !match[1]) {
                throw new plugin_error_1.default('decrypt', 'Encoded string did not match format');
            }
            input = match[1];
        }
        const { region } = options;
        const kms = new aws_sdk_1.KMS({
            credentials: awsMasterCredentials_1.master,
            region,
        });
        const decryptResult = await kms
            .decrypt({
            CiphertextBlob: Buffer.from(input, 'base64'),
        })
            .promise();
        const decoded = decryptResult.Plaintext;
        (0, fancy_log_1.default)('Decrypted secret:\n' + (0, colors_1.toCopy)(decoded.toString()));
    });
};
