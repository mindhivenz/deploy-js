"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterIsRole = exports.master = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
// Only use credentials from the env, to enforce they are not being stored unencrypted in the standard ini file
exports.master = new aws_sdk_1.default.EnvironmentCredentials('AWS');
const masterIsRole = async () => {
    await exports.master.getPromise();
    return !!exports.master.sessionToken;
};
exports.masterIsRole = masterIsRole;
