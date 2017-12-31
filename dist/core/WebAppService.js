"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _WebService = _interopRequireDefault(require("./WebService"));

var _dot = _interopRequireDefault(require("dot"));

var _path = _interopRequireDefault(require("path"));

var _cpy = _interopRequireDefault(require("cpy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WebAppService extends _WebService.default {
  constructor(opts) {
    super(opts);
  }

  defaults() {
    super.defaults();
    const base = this;

    if ('views' in this.options) {
      const path = path.join(this.cwd, '_views/');
      let views = [this.options.views];
      if (Array.isArray(this.options.views)) views = this.options.views;
      (0, _cpy.default)(views, '_views', {
        cwd: this.cwd
      }).then(() => {
        base.dots = _dot.default.process({
          path
        });
        base.server.engine('dot', (file, data, callback) => {
          const name = path.basename(file, '.dot');

          if (name in base.dots) {
            callback(null, base.dots[name](data));
          } else callback(new Error('Invalid template file ' + name));
        });
        base.server.set('views', path);
        base.server.set('view engine', 'dot');
      });
    }
  }

}

exports.default = WebAppService;