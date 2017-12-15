import Redbird from 'redbird';
import getLogger from './logger';
import PubSubClient from './PubSubClient';

export default class ServiceProxy
{
    constructor(opts){
        this.options = opts;
        this.name = "proxy";
        this.pubsub = new PubSubClient(opts.messageBus);
        this.server = new Redbird(opts);
        this.log    = getLogger.bind({options: opts.logging})('ServiceProxy');
        this.pubsub.onConnect(this.init)
    }

    init(){
        this.pubsub.subscribe('#service', this.onService);
    }

    onService(msg){
        const payload = JSON.parse(msg);

        this.server.register(`${this.options.host}:${this.options.port}/${payload.path}`,`http://${payload.service}:${payload.port}`);
        this.pubsub.send('#service-ack', {service: payload.service})
            .then(() => this.log.log({level:'info', message: `register http://${payload.service}:${payload.port}`}));
    }
}