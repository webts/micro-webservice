'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getLogger;

var _Defaults = require('../config/Defaults');

var _Defaults2 = _interopRequireDefault(_Defaults);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _expressWinston = require('express-winston');

var _expressWinston2 = _interopRequireDefault(_expressWinston);

var _winstonLogrotate = require('winston-logrotate');

var _winstonLogrotate2 = _interopRequireDefault(_winstonLogrotate);

var _winston_tcp = require('winston_tcp');

var _winston_tcp2 = _interopRequireDefault(_winston_tcp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { label, combine, timestamp, prettyPrint } = _winston.format;
//import winston_mongodb from 'winston-mongodb';


/**
 * create logging infrastructure based on the configuration
 * @param type
 * @param name
 * @return {DerivedLogger}
 */
function getLogger(type, name) {
    type = type || '';
    name = name || '';

    const defaults = require('../config/Defaults');
    let transports = [new _winston2.default.transports.Rotate({
        file: './logs/err.log',
        size: '50m',
        timestamp: true,
        colorize: false,
        json: false,
        keep: 20,
        level: 'error'
    }), new _winston2.default.transports.Rotate({
        file: './logs/info.log',
        size: '50m',
        timestamp: true,
        colorize: false,
        json: false,
        keep: 20,
        level: 'info'
    })];

    if ('logService' in defaults) {
        transports.push(new _winston_tcp2.default({
            host: defaults.logService.host,
            port: defaults.logService.port || 1337,
            json: false,
            timestamp: true
        }));
    }

    if (process.env.NODE_ENV !== 'production') {
        transports.push(new _winston2.default.transports.Console());
    }

    if (type === 'express') {
        return _expressWinston2.default.logger({
            name: name,
            transports: transports,
            meta: true,
            expressFormat: true,
            format: combine(label({ from: name }), timestamp(), prettyPrint())
        });
    }
    return _winston2.default.createLogger({
        name: name,
        transports: transports,
        exitOnError: false,
        format: combine(label({ from: name }), timestamp(), prettyPrint())
    });
}