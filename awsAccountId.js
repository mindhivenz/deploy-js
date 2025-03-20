"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const memoize_1 = __importDefault(require("lodash/memoize"));
const awsProjCredentials_1 = require("./internal/awsProjCredentials");
const getAccountId = async (options) => {
    const credentials = (0, awsProjCredentials_1.projCredentialsFactory)(options);
    const sts = new aws_sdk_1.default.STS({ credentials });
    const result = await sts.getCallerIdentity({}).promise();
    if (!result.Account) {
        throw new Error(`Unexpected no account returned`);
    }
    return result.Account;
};
exports.default = (0, memoize_1.default)(getAccountId, ({ proj, stage }) => `${proj}/${stage}`);
