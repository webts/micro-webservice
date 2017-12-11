'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _WebService = require('./WebService');

var _WebService2 = _interopRequireDefault(_WebService);

var _dot = require('dot');

var _dot2 = _interopRequireDefault(_dot);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cpy = require('cpy');

var _cpy2 = _interopRequireDefault(_cpy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let WebAppService = class WebAppService extends _WebService2.default {
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
            (0, _cpy2.default)(views, '_views', { cwd: this.cwd }).then(() => {
                base.dots = _dot2.default.process({ path });
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
};
exports.default = WebAppService;