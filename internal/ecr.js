"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoHost = void 0;
const awsAccountId_1 = __importDefault(require("../awsAccountId"));
const repoHost = async (options) => {
    const overrideAccountId = process.env.ECR_ACCOUNT_ID;
    const accountId = overrideAccountId || (await (0, awsAccountId_1.default)(options));
    return `${accountId}.dkr.ecr.${options.region}.amazonaws.com`;
};
exports.repoHost = repoHost;
