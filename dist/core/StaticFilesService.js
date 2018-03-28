"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _WebService = _interopRequireDefault(require("./WebService"));

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StaticFilesService extends _WebService.default {
  constructor(opts) {
    super(opts);
  }

  defaults() {
    super.defaults();
    this.server.use(_express.default.static(this.options.views || this.options.assets || this.options.root, {
      setHeaders: this.setHeaders
    }));
  }

  setHeaders(res, path, stat) {//override by plugins
  }

}

exports.default = StaticFilesService;
//# sourceMappingURL=StaticFilesService.js.map