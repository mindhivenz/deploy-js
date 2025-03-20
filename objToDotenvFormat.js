"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (obj) => Object.entries(obj).reduce((result, [k, v]) => `${result}${k}=${v}\n`, '');
