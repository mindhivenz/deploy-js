"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecr_1 = require("./internal/ecr");
exports.default = async (options) => {
    const host = await (0, ecr_1.repoHost)(options);
    return `${host}/${options.name}`;
};
