"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getLogger;

var _bunyan = _interopRequireDefault(require("bunyan"));

var _bunyanMiddleware = _interopRequireDefault(require("bunyan-middleware"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Rotate = require('winston-logrotate').Rotate;
/**
 * create logging infrastructure based on the configuration
 * @param type
 * @param name
 * @return {DerivedLogger}
 */


function getLogger(name, type) {
  type = type || '';
  name = name || '';
  /**
   const config = this.options;//require('../config/Defaults')();
   let transports = [
   new Rotate({
          file: './logs/err.log',
          size: '50m',
          timestamp: true,
          colorize: false,
          json: false,
          keep: 20,
          level: 'error',
          name: name + '_err'
      }),
   new Rotate({
          file: './logs/info.log',
          size: '50m',
          timestamp: true,
          colorize: false,
          json: false,
          keep: 20,
          level: 'info',
          name: name + '_info'
      }),
   new winston.transports.Console({colorize: true})
   ];
   */

  const transports = [{
    level: 'info',
    stream: process.stdout
  }, {
    level: 'error',
    stream: process.stderr
  }];

  let logger = _bunyan.default.createLogger({
    name: name,
    streams: transports
  });

  if (type === 'express') {
    (0, _debug.default)('create express-logger for ' + name);
    return (0, _bunyanMiddleware.default)({
      headerName: 'X-Request-Id',
      propertyName: 'reqId',
      logName: 'req_id(' + name + ')',
      logger: logger
    });
  }

  return logger;
}
//# sourceMappingURL=logger.js.map