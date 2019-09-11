import mongo from 'mongodb';
import {EventEmitter} from 'events';

/**
 * DB abstraction layer with partial transaction support for
 * mongodb
 */
export default class DbClient extends EventEmitter
{
    constructor(opts, transactionOpts){
        super();
        this.options = opts;
        this.transactionOptions = transactionOpts || {};
        this.db = null;
        this.connector = null;
        this.database = this.database.bind(this);
        this.begin = this.begin.bind(this);
        this.end = this.end.bind(this);
    }

    /**
     * return connection string
     * @return {string}
     */
    getConnectionUri(){
        let url = `mongodb://${this.options.username}:${this.options.password}@${this.options.host}:${ this.options.port || 27301}/`;

        if('authDb' in this.options && this.options.authDb !== ''){
            url += `${this.options.authDb}`;
        }else if ('authSource' in this.options && this.options.authSource !== ''){
            url += `${this.options.authSource}`;
        }

        if('uriOptions' in this.options && this.options.uriOptions !== ''){
            url += (this.options.uriOptions.charAt(0)!='?') ? '?' : '';
            url += `${this.options.uriOptions}`;
        }


        return url;
    }

    database(dbName){
        this.dbName = dbName;
    }

    /**
     * begin a transaction
     * this will open a connection to db
     * @return {Promise.<DbClient>}
     */
    async begin(){
        this.connector = await mongo.MongoClient.connect(this.getConnectionUri());
        this.db = this.connector.db(this.dbName);
        this.emit("DbClient:Open", "Open connection " + this.getConnectionUri());
    }

    /**
     * close the connection
     * @param client {mongo.MongoClient}
     * @return {Promise.<void>}
     */
    async end(){
        if(this.connector != null) {
            await this.connector.close();
            this.emit("DbClient:Close", "Closed connection " + this.getConnectionUri());
            this.connector = null;
            this.db = null;
        }
    }

    get client (){
        return this.db;
    }
}