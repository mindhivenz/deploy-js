"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readText_1 = __importDefault(require("./readText"));
exports.default = (path, options) => JSON.parse((0, readText_1.default)(path, options));
