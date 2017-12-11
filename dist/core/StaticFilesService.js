"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _WebService = require("./WebService");

var _WebService2 = _interopRequireDefault(_WebService);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let StaticFilesService = class StaticFilesService extends _WebService2.default {
    constructor(opts) {
        super(opts);
    }

    defaults() {
        super.defaults();
        this.server.use(_express2.default.static(this.options.views || this.options.assets || this.options.root, { setHeaders: this.setHeaders }));
    }

    setHeaders(res, path, stat) {
        //override by plugins
    }
};
exports.default = StaticFilesService;