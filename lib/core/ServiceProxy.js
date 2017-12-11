import Redbird from 'redbird';
import getLogger from './logger';
import defaults from '../config/Defaults';
import PubSubClient from './PubSubClient';

export default class ServiceProxy
{
    constructor(){
        this.options = defaults.proxyService;
        this.pubsub = new PubSubClient(defaults.messageBus);
        this.server = new Redbird(opts);
        this.log    = getLogger('','ServiceProxy');
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