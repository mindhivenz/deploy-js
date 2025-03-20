"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awsEnv_1 = require("./internal/awsEnv");
const awsProjCredentials_1 = require("./internal/awsProjCredentials");
exports.default = async ({ region, ...projOptions }) => {
    const credentials = (0, awsProjCredentials_1.projCredentialsFactory)(projOptions);
    return await (0, awsEnv_1.credentialsEnv)(credentials, { region });
};
