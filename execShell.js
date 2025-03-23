"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const execCommon_1 = require("./internal/execCommon");
exports.default = async (command, args = [], opts = {}) => await (0, execCommon_1.execCommand)({ shell: true, pluginName: '@mindhive/deploy/execShell' }, command, args, opts);
