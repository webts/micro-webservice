import util from 'util';
import express from 'express';
import cors from 'cors';
import globby from 'globby';
import debug from 'debug';

import logger from './logger';
import Session from './Session';
import DbClient from './DbClient';
import PubSubClient from './PubSubClient';
import Authenticator from "./Authenticator";

function getParams(func) {
    let str = func.toString();
    const len = str.indexOf("(");
    return str.substr(len + 1, str.indexOf(")") - len - 1).replace(/ /g, "").split(',')
}

export default class WebService {
    constructor(opts) {
        this.options = opts;
        this.name = opts.name || opts.container_name;
        this.cwd = opts.root;

        /**
         *
         * @type {*|express}
         */
        this.server = express();
        this.router = express.Router();

        this.port = opts.port || 3000;


        if (typeof opts.db !== 'undefined') {
            this.getDb = () => {
                return new DbClient(this.options.db);
            }
        }

        if (typeof opts.session !== 'undefined') {
            this.session = new Session(this.options.session);
        }

        this.pubsub = new PubSubClient(this.options.messageBus);
        this.authenticator = new Authenticator(this);
        this.logger = logger.bind({options:this.options.logging})(this.name);

        let srcs = [];
        if ('deps' in this.options) {
            if (Array.isArray(this.options.deps)) {
                Array.prototype.push.apply(srcs, this.options.deps);
            }
            else {
                srcs.push(this.options.deps);
            }
        }
        if ('src' in this.options) {
            if (Array.isArray(this.options.src)) {
                Array.prototype.push.apply(srcs, this.options.src);
            }
            else {
                srcs.push(this.options.src);
            }
        }

        this.register(srcs).then(() => this.log({level:'info', message:'Plugins registered'}));

        this.defaults();

        this.server.use(this.router);
    }

    async register(filePattern) {
        const base = this;

        let patterns = [filePattern];
        if(Array.isArray(filePattern)) patterns = filePattern;

        try {
            const plugins = await globby(patterns, {realpath: true, cwd: this.cwd, expandDirectories:true});
            if (plugins && plugins.length > 0)
            {
                plugins.forEach((file) =>
                {
                    debug('service registers ' + file);
                    let fn = require(file);
                    if (typeof fn === 'function')
                    {
                        if ('attributes' in fn)
                        {
                            const attrs = fn.attributes;
                            if ('uri' in attrs) {
                                const uri = this.name + '/' + attrs.uri;
                                if ('nowrap' in attrs) {
                                    if ('method' in attrs) {
                                        const method = attrs.method;
                                        this.router[method](uri, this.authen(), fn.bind({app: base}));
                                    }
                                    else
                                        this.router.all(uri, this.authen(), fn.bind({app: base}));
                                }
                                else
                                {
                                    let wrapFn = async (req, res, next) =>
                                    {
                                        const params = getParams(fn);
                                        let vals = params.map((p) => {return req.param(p)});
                                        const domain = req.hostname.split('.').length > 1 ? req.hostname.split('.')[0]: '';
                                        try {
                                            const fnVal = await fn.apply({app: base, user: req.user, domain:domain, next:next}, vals);

                                            //TODO: currently support only json render
                                            res.json(fnVal);
                                        }
                                        catch(err){
                                            this.log({
                                                level:'error',
                                                message: err.message
                                            });
                                            res.status(404).send(err.message);
                                        }
                                    };

                                    if ('method' in attrs) {
                                        const method = attrs.method;
                                        this.router[method](uri, this.authen(), wrapFn);
                                    }
                                    else
                                        this.router.all(uri, this.authen(), wrapFn);
                                }
                            }
                        }
                        else {
                            fn.call(null, this);
                        }
                    }
                });
            }
        }
        catch (err) {
            this.log({
                level: 'error',
                message: err.message
            })
        }
    }

    start()
    {
        this.log({
            level:'info',
            message: `service ${this.name} listening at port ${this.port}`
        });
        this.server.listen(this.port);
        //notify the proxy registry
        this.pubsub.send('#service', JSON.stringify({
            service: this.name,
            port: this.port,
            path: this.name
        }) );

        //set hook on process kill signal
        this.status = 'running';
        process.on('SIGINT', this.stop);
        process.on('SIGTERM', this.stop);
    }

    stop()
    {
        if(this.status === 'running') {
            //clean up
            this.log({
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
        this.server.use(express.json());
        this.server.use(cors());
        this.server.use(logger.bind({options:this.options.logging})(this.name,'express'));
    }

    /**
     * this will be overwrite by Authenticator
     */
    authen() {
        return this.authenticator.authenticate;
    }

    tokenUtil(opKind, data)
    {
        Promise.reject(new Error('tokenUtil is not implemented'));
    }

    log(obj){
        let level = 'info';
        if(util.isObject(obj) && 'level' in obj)
            level = obj.level;

        let msg = '';

        if(util.isObject(obj) && 'message' in obj)
            msg = obj.message;
        else
            msg = obj;

        if(level in this.logger)
        {
            this.logger[level](msg);
        }
    }

}