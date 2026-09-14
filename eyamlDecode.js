"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENC_PATTERN = void 0;
const aws_sdk_1 = require("aws-sdk");
const plugin_error_1 = __importDefault(require("plugin-error"));
const awsMasterCredentials_1 = require("./internal/awsMasterCredentials");
const pluginName = '@mindhivenz/deploy/eyamlDecode';
exports.ENC_PATTERN = /^ENC\[KMS,([\s\S]*)]$/;
// Accepts either a whole ENC[KMS,...] token or the bare base64 ciphertext
exports.default = async (encoded, { region }) => {
    let cipher = encoded.trim();
    if (cipher.startsWith('ENC[')) {
        const match = cipher.match(exports.ENC_PATTERN);
        if (!match || !match[1]) {
            throw new plugin_error_1.default(pluginName, 'Encoded string did not match format');
        }
        cipher = match[1];
    }
    const kms = new aws_sdk_1.KMS({
        credentials: awsMasterCredentials_1.master,
        region,
    });
    const decryptResult = await kms
        .decrypt({
        CiphertextBlob: Buffer.from(cipher.replace(/\s/g, ''), 'base64'),
    })
        .promise();
    return decryptResult.Plaintext.toString();
};
