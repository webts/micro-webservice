"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redisSessions = _interopRequireDefault(require("redis-sessions"));

var _redis = _interopRequireDefault(require("redis"));

var _utilPromisifyall = _interopRequireDefault(require("util-promisifyall"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _utilPromisifyall.default)(_redis.default.RedisClient.prototype);
(0, _utilPromisifyall.default)(_redis.default.Multi.prototype);

class Session {
  constructor(opts) {
    this.options = opts;
    this.redisClient = _redis.default.createClient({
      host: opts.host,
      port: opts.port || 6379
    });
    this.client = new _redisSessions.default({
      host: opts.host,
      port: opts.port || 6379,
      namespace: 'ses'
    });
    this.defaultTTL = opts.ttl || 7200;
    this.create = this.create.bind(this);
    this.createFromReq = this.createFromReq.bind(this);
    this.get = this.get.bind(this);
    this.getFromReq = this.getFromReq.bind(this);
    this.save = this.save.bind(this);
    this.close = this.close.bind(this);
  }

  create(domain, user_id, ip, data) {
    return new Promise((resolve, reject) => {
      this.client.create({
        app: domain,
        id: user_id,
        ip: ip,
        ttl: this.defaultTTL,
        d: data
      }, function (err, resp) {
        if (err) reject(err);else {
          resolve(resp);
        }
      });
    });
  }

  async createFromReq(req) {
    const domain = req.hostname.split('.').length > 1 ? req.hostname.split('.')[0] : '';
    if (domain === '') throw new Error('Cannot initiate session from invalid domain');
    return await this.create(domain, req.user.id, req.ip, {
      request: req.url
    });
  }

  get(domain, token) {
    return new Promise((resolve, reject) => {
      this.client.get({
        app: domain,
        token
      }, function (err, resp) {
        if (err) reject(err);else {
          resolve(resp);
        }
      });
    });
  }

  async getFromReq(req) {
    const domain = req.hostname.split('.').length > 1 ? req.hostname.split('.')[0] : '';
    if (domain === '') throw new Error('Cannot get session from invalid domain'); //default implementation to get token from BEARER protocol

    let tokenSrc = req.header("Authentication");
    let tokenData = tokenSrc.replace(/^bearer/i, '').trim().split(',').map(data => {
      data = data.trim();
      let {
        key,
        val
      } = data.split('=');
      return {
        key,
        val
      };
    }).filter(pair => {
      return pair.key.toLowerCase() === 'authenticationtoken';
    });
    if (tokenData.length === 0) throw new Error('Cannot find the token from request\'s header');
    return await this.get(domain, tokenData[0].val);
  }

  async save(domain, token, data) {
    return new Promise((resolve, reject) => {
      this.client.set({
        app: domain,
        token: token,
        d: data
      }, function (err, resp) {
        if (err) reject(err);else {
          resolve(resp);
        }
      });
    });
  }

  async close() {
    this.redisClient.quit();
    this.client.quit();
  }

}

exports.default = Session;
//# sourceMappingURL=Session.js.map