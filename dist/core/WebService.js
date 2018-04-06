"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = _interopRequireDefault(require("util"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _globby = _interopRequireDefault(require("globby"));

var _path = _interopRequireDefault(require("path"));

var _logger = _interopRequireDefault(require("./logger"));

var _Session = _interopRequireDefault(require("./Session"));

var _DbClient = _interopRequireDefault(require("./DbClient"));

var _PubSubClient = _interopRequireDefault(require("./PubSubClient"));

var _Authenticator = _interopRequireDefault(require("./Authenticator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getParams(func) {
  let str = func.toString();
  const len = str.indexOf("(");
  return str.substr(len + 1, str.indexOf(")") - len - 1).replace(/ /g, "").split(',');
}

class WebService {
  constructor(opts) {
    this.options = opts;
    this.name = opts.name || opts.container_name;
    this.cwd = opts.root;
    /**
     *
     * @type {*|express}
     */

    this.server = (0, _express.default)();
    this.router = _express.default.Router();
    this.port = opts.port || 3000;

    if (typeof opts.db !== 'undefined') {
      this.getDb = () => {
        return new _DbClient.default(this.options.db);
      };
    }

    if (typeof opts.session !== 'undefined') {
      this.session = new _Session.default(this.options.session);
    }

    this.pubsub = new _PubSubClient.default(this.options.messageBus);
    this.authenticator = new _Authenticator.default(this);
    this.logger = _logger.default.bind({
      options: this.options.logging
    })(this.name);
    let srcs = [];

    if ('deps' in this.options) {
      if (Array.isArray(this.options.deps)) {
        Array.prototype.push.apply(srcs, this.options.deps);
      } else {
        srcs.push(this.options.deps);
      }
    }

    if ('src' in this.options) {
      if (Array.isArray(this.options.src)) {
        Array.prototype.push.apply(srcs, this.options.src);
      } else {
        srcs.push(this.options.src);
      }
    }

    this.register(srcs).then(() => this.log({
      level: 'info',
      message: 'Plugins registered'
    }));
    this.defaults();
    this.server.use(this.router);
  }

  async register(filePattern) {
    const base = this;
    this.log('cwd ' + this.cwd);
    let patterns = [filePattern];
    if (Array.isArray(filePattern)) patterns = filePattern;
    patterns = patterns.map(file => _path.default.resolve(this.cwd, file));

    try {
      const plugins = await (0, _globby.default)(patterns, {
        realpath: true,
        expandDirectories: true
      });

      if (plugins && plugins.length > 0) {
        plugins.forEach(file => {
          this.log('service registers ' + file);

          let fn = require(file);

          if (typeof fn === 'function') {
            if ('attributes' in fn) {
              const attrs = fn.attributes;

              if ('uri' in attrs) {
                let uri = '';
                if (attrs.uri.startsWith('/')) uri = attrs.uri;else uri = `/api/${this.name}/${attrs.uri}`;

                if ('nowrap' in attrs) {
                  if ('method' in attrs) {
                    const method = attrs.method;
                    this.router[method](uri, this.authen(), fn.bind({
                      app: base
                    }));
                  } else this.router.all(uri, this.authen(), fn.bind({
                    app: base
                  }));
                } else {
                  let wrapFn = async (req, res, next) => {
                    const params = getParams(fn);
                    let vals = params.map(p => {
                      return req.param(p);
                    });
                    const domain = req.hostname.split('.').length > 1 ? req.hostname.split('.')[0] : '';

                    try {
                      const fnVal = await fn.apply({
                        app: base,
                        user: req.user,
                        domain: domain,
                        next: next
                      }, vals); //TODO: currently support only json render

                      res.json(fnVal);
                    } catch (err) {
                      this.log({
                        level: 'error',
                        message: err.message
                      });
                      res.status(404).send(err.message);
                    }
                  };

                  if ('method' in attrs) {
                    const method = attrs.method;
                    this.router[method](uri, this.authen(), wrapFn);
                  } else this.router.all(uri, this.authen(), wrapFn);
                }
              }
            } else {
              fn.call(null, this);
            }
          }
        });
      }
    } catch (err) {
      this.log({
        level: 'error',
        message: err.message
      });
    }
  }

  start() {
    this.log({
      level: 'info',
      message: `service ${this.name} listening at port ${this.port}`
    });
    this.server.listen(this.port); //notify the proxy registry

    this.pubsub.send('#service', JSON.stringify({
      service: this.name,
      port: this.port,
      path: this.name
    })); //set hook on process kill signal

    this.status = 'running';
    process.on('SIGINT', this.stop);
    process.on('SIGTERM', this.stop);
  }

  stop() {
    if (this.status === 'running') {
      //clean up
      this.log({
        level: 'info',
        message: `service ${this.name} listening at port ${this.port}`
      });
      this.pubsub.send('#service', JSON.stringify({
        service: this.name,
        port: this.port,
        path: this.name
      }));
    }
  }

  defaults() {
    this.server.use(_express.default.json());
    this.server.use((0, _cors.default)());
    this.server.use(_logger.default.bind({
      options: this.options.logging
    })(this.name, 'express'));
  }
  /**
   * this will be overwrite by Authenticator
   */


  authen() {
    return this.authenticator.authenticate;
  }

  tokenUtil(opKind, data) {
    Promise.reject(new Error('tokenUtil is not implemented'));
  }

  log(obj) {
    let level = 'info';
    if (_util.default.isObject(obj) && 'level' in obj) level = obj.level;
    let msg = '';
    if (_util.default.isObject(obj) && 'message' in obj) msg = obj.message;else msg = obj;

    if (level in this.logger) {
      this.logger[level](msg);
    }
  }

}

exports.default = WebService;
//# sourceMappingURL=WebService.js.map