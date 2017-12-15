'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _DbClient = require('./DbClient');

var _DbClient2 = _interopRequireDefault(_DbClient);

var _PubSubClient = require('./PubSubClient');

var _PubSubClient2 = _interopRequireDefault(_PubSubClient);

var _Authenticator = require('./Authenticator');

var _Authenticator2 = _interopRequireDefault(_Authenticator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getParams(func) {
    let str = func.toString();
    const len = str.indexOf("(");
    return str.substr(len + 1, str.indexOf(")") - len - 1).replace(/ /g, "").split(',');
}

let WebService = class WebService {
    constructor(opts) {
        this.options = opts;
        this.name = opts.name || opts.container_name;
        this.cwd = opts.root;

        /**
         *
         * @type {*|express}
         */
        this.server = (0, _express2.default)();
        this.router = _express2.default.Router();

        this.port = opts.port || 3000;

        if (typeof opts.db !== 'undefined') {
            this.getDb = () => {
                return new _DbClient2.default(this.options.db);
            };
        }

        if (typeof opts.session !== 'undefined') {
            this.session = new _Session2.default(this.options.session);
        }

        this.pubsub = new _PubSubClient2.default(this.options.messageBus);
        this.authenticator = new _Authenticator2.default(this);
        this.logger = _logger2.default.bind({ options: this.options.logging })(this.name, 'express');

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

        this.register(srcs).then(() => this.logger.log({ level: 'info', message: 'Plugins registered' }));

        this.defaults();

        this.server.use(this.router);
    }

    async register(filePattern) {
        const base = this;

        let patterns = [filePattern];
        if (Array.isArray(filePattern)) patterns = filePattern;

        try {
            const plugins = await (0, _globby2.default)(patterns, { realpath: true, cwd: this.cwd, expandDirectories: true });
            if (plugins && plugins.length > 0) {
                plugins.forEach(file => {
                    let fn = require(file);
                    if (typeof fn === 'function') {
                        if ('attributes' in fn) {
                            const attrs = fn.attributes;
                            if ('uri' in attrs) {
                                const uri = this.name + '/' + attrs.uri;
                                if ('nowrap' in attrs) {
                                    if ('method' in attrs) {
                                        const method = attrs.method;
                                        this.router[method](uri, this.authen(), fn.bind({ app: base }));
                                    } else this.router.all(uri, this.authen(), fn.bind({ app: base }));
                                } else {
                                    let wrapFn = async (req, res, next) => {
                                        const params = getParams(fn);
                                        let vals = params.map(p => {
                                            return req.param(p);
                                        });
                                        const domain = req.hostname.split('.').length > 1 ? req.hostname.split('.')[0] : '';
                                        try {
                                            const fnVal = await fn.apply({ app: base, user: req.user, domain: domain, next: next }, vals);

                                            //TODO: currently support only json render
                                            res.json(fnVal);
                                        } catch (err) {
                                            this.logger.log({
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
            this.logger.log({
                level: 'error',
                message: err.message
            });
        }
    }

    start() {
        this.logger.log({
            level: 'info',
            message: `service ${this.name} listening at port ${this.port}`
        });
        this.server.listen(this.port);
        //notify the proxy registry
        this.pubsub.send('#service', JSON.stringify({
            service: this.name,
            port: this.port,
            path: this.name
        }));

        //set hook on process kill signal
        this.status = 'running';
        process.on('SIGINT', this.stop);
        process.on('SIGTERM', this.stop);
    }

    stop() {
        if (this.status === 'running') {
            //clean up
            this.logger.log({
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
        this.server.json();
        this.server.use((0, _cors2.default)());
    }

    /**
     * this will be overwrite by Authenticator
     */
    authen() {
        return this.authenticator.authenticate;
    }

    tokenUtil(opKind, data) {
        switch (opKind) {
            case 'get':

                break;
            case 'save':

                break;
            case 'delete':

                break;

        }
    }

};
exports.default = WebService;