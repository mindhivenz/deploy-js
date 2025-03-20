"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const awsMasterCredentials_1 = require("./internal/awsMasterCredentials");
exports.default = async (secret, { proj, region }) => {
    const kms = new aws_sdk_1.KMS({
        credentials: awsMasterCredentials_1.master,
        region,
    });
    const encryptResult = await kms
        .encrypt({
        KeyId: `alias/${proj}-control`,
        Plaintext: secret,
    })
        .promise();
    const encoded = encryptResult.CiphertextBlob.toString('base64');
    return `ENC[KMS,${encoded}]`;
};
