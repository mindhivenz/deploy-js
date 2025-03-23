"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const plugin_error_1 = __importDefault(require("plugin-error"));
exports.default = (config) => (done) => {
    const webpack = require('webpack');
    try {
        webpack(config, (err, stats) => {
            if (err) {
                throw new plugin_error_1.default('webpack', err);
            }
            (0, fancy_log_1.default)('[webpack]', stats.toString({
            // output options
            }));
            done();
        });
    }
    catch (e) {
        throw new plugin_error_1.default('webpack', e);
    }
};
