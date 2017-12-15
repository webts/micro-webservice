import winston, {format} from 'winston';
const {label, combine, timestamp, prettyPrint } = format;
import winston_express from 'express-winston';
//import winston_mongodb from 'winston-mongodb';
//import logrotate from 'winston-logrotate';
import winston_tcp from 'winston_tcp';

/**
 * create logging infrastructure based on the configuration
 * @param type
 * @param name
 * @return {DerivedLogger}
 */
export default function getLogger(name, type){
    type = type || '';
    name = name || '';

    const config = this.options;//require('../config/Defaults')();
    let transports = [
        new winston.transports.Rotate({
            file: './logs/err.log',
            size: '50m',
            timestamp: true,
            colorize: false,
            json:false,
            keep: 20,
            level: 'error'
        }),
        new winston.transports.Rotate({
            file: './logs/info.log',
            size: '50m',
            timestamp: true,
            colorize: false,
            json:false,
            keep: 20,
            level: 'info'
        })
    ];

    if('logService' in config)
    {
        transports.push(new winston_tcp({
            host: config.logService.host,
            port: config.logService.port || 1337,
            json: false,
            timestamp: true
        }));
    }

    if (process.env.NODE_ENV !== 'production') {
        transports.push(new winston.transports.Console());
    }

    if(type === 'express')
    {
        return winston_express.logger({
            name: name,
            transports: transports,
            meta:true,
            expressFormat: true,
            format: combine(label({from: name}), timestamp(), prettyPrint() )
        })
    }
    return winston.createLogger({
        name: name,
        transports: transports,
        exitOnError: false,
        format: combine(label({from: name}), timestamp(), prettyPrint() )
    });
}