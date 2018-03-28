import bunyan from 'bunyan';
import bunyanMiddleware from 'bunyan-middleware';
import debug from 'debug';

const Rotate = require('winston-logrotate').Rotate;

/**
 * create logging infrastructure based on the configuration
 * @param type
 * @param name
 * @return {DerivedLogger}
 */
export default function getLogger(name, type) {
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

    const transports = [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            stream: process.stderr
        },
        {
            type: 'rotating-file',
            path: './logs/' + name + '.log',
            period: '1d',
            count: 10
        }

    ];

    let logger = bunyan.createLogger({
        name: name,
        streams: transports
    });

    if (type === 'express') {

        debug('create express-logger for ' + name);
        return bunyanMiddleware({
                headerName: 'X-Request-Id'
                , propertyName: 'reqId'
                , logName: 'req_id(' + name + ')'
                , logger: logger
            }
        );
    }

    return logger;
}