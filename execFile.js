"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const execCommon_1 = require("./internal/execCommon");
exports.default = async (file, args = [], opts = {}) => await (0, execCommon_1.execCommand)({ shell: false, pluginName: '@mindhivenz/deploy/execFile' }, file, args, opts);
