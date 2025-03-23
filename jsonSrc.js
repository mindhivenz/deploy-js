"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const buildSrc_1 = __importDefault(require("./buildSrc"));
const jsonPretty_1 = __importDefault(require("./jsonPretty"));
exports.default = (filename, obj) => {
    const resolvePretty = async () => (0, jsonPretty_1.default)(await obj);
    return (0, buildSrc_1.default)(filename, resolvePretty());
};
