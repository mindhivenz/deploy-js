"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialsEnv = void 0;
const credentialsEnv = async (credentials, { region } = {}) => {
    await credentials.getPromise();
    return {
        AWS_ACCESS_KEY_ID: credentials.accessKeyId,
        AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
        AWS_SESSION_TOKEN: credentials.sessionToken,
        AWS_SECURITY_TOKEN: credentials.sessionToken,
        ...(region && { AWS_REGION: region }),
    };
};
exports.credentialsEnv = credentialsEnv;
