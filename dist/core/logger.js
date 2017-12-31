"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getLogger;

var _winston = _interopRequireWildcard(require("winston"));

var _expressWinston = _interopRequireDefault(require("express-winston"));

var _winstonLogrotate = _interopRequireDefault(require("winston-logrotate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const {
  label,
  combine,
  timestamp,
  prettyPrint
} = _winston.format;

/**
 * create logging infrastructure based on the configuration
 * @param type
 * @param name
 * @return {DerivedLogger}
 */
function getLogger(name, type) {
  type = type || '';
  name = name || '';
  const config = this.options; //require('../config/Defaults')();

  let transports = [new _winston.default.transports.Rotate({
    file: './logs/err.log',
    size: '50m',
    timestamp: true,
    colorize: false,
    json: false,
    keep: 20,
    level: 'error'
  }), new _winston.default.transports.Rotate({
    file: './logs/info.log',
    size: '50m',
    timestamp: true,
    colorize: false,
    json: false,
    keep: 20,
    level: 'info'
  })];

  if ('logService' in config) {
    transports.push(new winston_tcp({
      host: config.logService.host,
      port: config.logService.port || 1337,
      json: false,
      timestamp: true
    }));
  }

  if (process.env.NODE_ENV !== 'production') {
    transports.push(new _winston.default.transports.Console());
  }

  if (type === 'express') {
    return _expressWinston.default.logger({
      name: name,
      transports: transports,
      meta: true,
      expressFormat: true,
      format: combine(label({
        from: name
      }), timestamp(), prettyPrint())
    });
  }

  return _winston.default.createLogger({
    name: name,
    transports: transports,
    exitOnError: false,
    format: combine(label({
      from: name
    }), timestamp(), prettyPrint())
  });
}