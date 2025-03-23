"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const lib_1 = __importDefault(require("hash-mod/lib"));
const hash = (0, lib_1.default)(256);
exports.default = (hashKey) => `10.${hash(hashKey)}`;
