"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const into_stream_1 = __importDefault(require("into-stream"));
const vinyl_buffer_1 = __importDefault(require("vinyl-buffer"));
const vinyl_source_stream_1 = __importDefault(require("vinyl-source-stream"));
exports.default = (filename, content) => (0, into_stream_1.default)(content).pipe((0, vinyl_source_stream_1.default)(filename)).pipe((0, vinyl_buffer_1.default)());
