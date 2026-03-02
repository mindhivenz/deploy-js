"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const devName_1 = __importDefault(require("./devName"));
const stages_1 = require("./stages");
exports.default = (stage, devName = (0, devName_1.default)()) => stage === stages_1.DEV_OWN_ACCOUNT_STAGE ? `dev-${devName}` : stage;
