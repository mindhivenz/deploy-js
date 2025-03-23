"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dim = exports.highlight = exports.task = exports.toCopy = exports.url = exports.commandLine = exports.error = void 0;
const ansi_colors_1 = __importDefault(require("ansi-colors"));
exports.error = ansi_colors_1.default.red;
exports.commandLine = ansi_colors_1.default.blue;
exports.url = ansi_colors_1.default.blue.underline;
exports.toCopy = ansi_colors_1.default.yellow;
exports.task = ansi_colors_1.default.cyan;
exports.highlight = ansi_colors_1.default.bold;
exports.dim = ansi_colors_1.default.dim;
