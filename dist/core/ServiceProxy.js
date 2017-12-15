'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _redbird = require('redbird');

var _redbird2 = _interopRequireDefault(_redbird);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _PubSubClient = require('./PubSubClient');

var _PubSubClient2 = _interopRequireDefault(_PubSubClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ServiceProxy = class ServiceProxy {
    constructor(opts) {
        this.options = opts;
        this.name = "proxy";
        this.pubsub = new _PubSubClient2.default(opts.messageBus);
        this.server = new _redbird2.default(opts);
        this.log = _logger2.default.bind({ options: opts.logging })('ServiceProxy');
        this.pubsub.onConnect(this.init);
    }

    init() {
        this.pubsub.subscribe('#service', this.onService);
    }

    onService(msg) {
        const payload = JSON.parse(msg);

        this.server.register(`${this.options.host}:${this.options.port}/${payload.path}`, `http://${payload.service}:${payload.port}`);
        this.pubsub.send('#service-ack', { service: payload.service }).then(() => this.log.log({ level: 'info', message: `register http://${payload.service}:${payload.port}` }));
    }
};
exports.default = ServiceProxy;