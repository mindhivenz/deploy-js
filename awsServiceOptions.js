"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awsProjCredentials_1 = require("./internal/awsProjCredentials");
exports.default = (options) => ({
    credentials: (0, awsProjCredentials_1.projCredentialsFactory)(options),
    region: options.region,
});
