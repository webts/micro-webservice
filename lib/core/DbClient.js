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
        this.client = null;
        this.database = this.database.bind(this);
        this.begin = this.begin.bind(this);
        this.end = this.end.bind(this);
    }

    /**
     * return connection string
     * @return {string}
     */
    getConnectionUri(){
        let url = `mongodb://${this.options.username}:${this.options.password}@${this.options.host}:${ this.options.port || 27301}/${this.dbName}`;
        if(this.options.authSource){
            url += `?authSource=${this.options.authSource}`;
        }

        return url;
    }

    async find(query){
        if(this.client){
            return await this.client.find(query);
        }

        return null;
    }

    async getById(id){
        if(this.client){
            return await  this.client.find({id});
        }

        return null;
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
        this.client = await mongo.MongoClient.connect(this.getConnectionUri());
        this.emit("DbClient:Open", "Open connection " + this.getConnectionUri());
    }

    /**
     *
     * @param client {mongo.MongoClient}
     * @return {Promise.<void>}
     */
    async end(){
        await this.client.close();

        this.emit("DbClient:Close", "Closed connection " + this.getConnectionUri());
    }
}