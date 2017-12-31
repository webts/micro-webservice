"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _redisSessions = _interopRequireDefault(require("redis-sessions"));

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Session {
  constructor(opts) {
    this.options = opts;
    this.client = new _redisSessions.default({
      host: opts.host,
      port: opts.port || 6379,
      namespace: 'ses'
    });
    this.defaultTTL = opts.ttl || 7200;
  }

  async create(domain, user_id, ip, data) {
    return (0, _util.promisify)(this.client.create)({
      app: domain,
      id: user_id,
      ip: ip,
      ttl: this.defaultTTL,
      d: data
    });
  }

  async createFromReq(req) {
    const domain = req.hostname.split('.').length > 1 ? req.hostname.split('.')[0] : '';
    if (domain === '') throw new Error('Cannot initiate session from invalid domain');
    return await this.create(domain, req.user.id, req.ip, {
      request: req.url
    });
  }

  async get(domain, token) {
    return await (0, _util.promisify)(this.client.get)(domain, token);
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
    const save = (0, _util.promisify)(this.client.set);
    return await save({
      app: domain,
      token: token,
      d: data
    });
  }

}

exports.default = Session;