'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _asyncMqtt = require('async-mqtt');

var _asyncMqtt2 = _interopRequireDefault(_asyncMqtt);

var _mqtt = require('mqtt');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let PubSubClient = class PubSubClient {
    constructor(opts) {
        /**
         * @private
         */
        this.options = opts;
        /**
         * @private
         * @type {{}}
         */
        this.topics = {};
        /**
         * @private
         */
        this.log = _logger2.default.bind({ options: this.options.logging })('pubsub');

        /**
         * @private
         * @class {MqttClient}
         */
        this.client = _asyncMqtt2.default.connect(opts.pubsub.url, opts.pubsub.options);
    }

    async send(topic, payload) {
        if (typeof payload === 'object') payload = JSON.stringify(payload);

        await this.client.publish(topic, payload);
        return this.client.end();
    }

    subscribe(topic, callback) {
        if (topic in this.topics) return true;

        this.topics[topic] = callback;
        if (this.isConnected) this.client.subscribe(topic);

        throw new Error("PubSubClient is not ready");
    }

    async destroy() {
        //unsubscribe all topics
        Object.keys(this.topics).forEach(async topic => {
            try {
                await this.client.unsubscribe(topic);
            } catch (err) {
                this.log.log({
                    level: 'error',
                    message: err.stack || err.message,
                    meta: { from: 'PubSubClient' }
                });
            }
        });

        delete this.topics;
    }

    onConnect(cb) {
        if (this.isConnected) cb.call(null);else {
            /**
             * @private
             */
            this.connectedCallback = cb;

            this.client.on('connect', this._connected);
        }
    }

    onMessage(topic, msg) {
        let cb = this.topics[topic];
        if (cb !== null && typeof cb === 'function') {
            cb.call(null, msg);
        }
    }

    _connected() {
        this.isConnected = true;
        if (this.connectedCallback && typeof this.connectedCallback === 'function') {
            this.connectedCallback.call(null);
            delete this.connectedCallback;
        }
    }
};
exports.default = PubSubClient;