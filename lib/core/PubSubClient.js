import mqtt from 'async-mqtt';
import {MqttClient} from 'mqtt';
import getLogger from './logger';

export default class PubSubClient {
    constructor(opts) {

        
        if(!('url' in opts)){
            opts.url = 'mqtt://' + opts.host + (opts.port ? opts.port :'');
        }

        /**
         * @private
         */
        this.options = opts;
        /**
         * @private
         * @type {{}}
         */
        this.topics = {};
        /**
         * @private
         */
        this.log    = getLogger.bind({options: this.options.logging})('pubsub');

        /**
         * @private
         * @class {MqttClient}
         */
        this.client = mqtt.connect(opts.url, opts.options);
        this.send = this.send.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.destroy = this.destroy.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    async send(topic, payload) {
        if(typeof payload === 'object')
            payload = JSON.stringify(payload);

        await this.client.publish(topic, payload);
        return this.client.end();
    }

    subscribe(topic, callback) {
        if (topic in this.topics)
            return true;

        this.topics[topic] = callback;
        if(this.isConnected)
            this.client.subscribe(topic);

        throw new Error("PubSubClient is not ready");
    }

    async destroy() {
        //unsubscribe all topics
        Object.keys(this.topics).forEach(async (topic) => {
            try {
                await this.client.unsubscribe(topic)
            }
            catch (err) {
                this.log.log({
                    level:'error',
                    message: err.stack || err.message,
                    meta:{from: 'PubSubClient'}
                })
            }
        });

        delete this.topics;
    }

    onConnect(cb){
        if(this.isConnected)
            cb.call(null);
        else {
            /**
             * @private
             */
            this.connectedCallback = cb;

            this.client.on('connect', this._connected);
        }
    }

    onMessage(topic, msg){
        let cb = this.topics[topic];
        if(cb !== null && typeof cb === 'function'){
            cb.call(null, msg);
        }
    }

    _connected(){
        this.isConnected = true;
        if(this.connectedCallback && typeof this.connectedCallback === 'function'){
            this.connectedCallback.call(null);
            delete this.connectedCallback;
        }
    }
}