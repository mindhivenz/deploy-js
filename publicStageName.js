"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const devName_1 = __importDefault(require("./devName"));
exports.default = (stage, devName = (0, devName_1.default)()) => stage === 'dev' ? `dev-${devName}` : stage;
