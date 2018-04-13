"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongodb = _interopRequireDefault(require("mongodb"));

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DB abstraction layer with partial transaction support for
 * mongodb
 */
class DbClient extends _events.EventEmitter {
  constructor(opts, transactionOpts) {
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


  getConnectionUri() {
    let url = `mongodb://${this.options.username}:${this.options.password}@${this.options.host}:${this.options.port || 27301}/`;

    if ('authSource' in this.options && this.options.authSource !== '') {
      url += `?authSource=${this.options.authSource}`;
    }

    return url;
  }

  database(dbName) {
    this.dbName = dbName;
  }
  /**
   * begin a transaction
   * this will open a connection to db
   * @return {Promise.<DbClient>}
   */


  async begin() {
    this.connector = await _mongodb.default.MongoClient.connect(this.getConnectionUri());
    this.db = this.connector.db(this.dbName);
    this.emit("DbClient:Open", "Open connection " + this.getConnectionUri());
  }
  /**
   * close the connection
   * @param client {mongo.MongoClient}
   * @return {Promise.<void>}
   */


  async end() {
    if (this.connector != null) {
      await this.connector.close();
      this.emit("DbClient:Close", "Closed connection " + this.getConnectionUri());
      this.connector = null;
      this.db = null;
    }
  }

  get client() {
    return this.db;
  }

}

exports.default = DbClient;
//# sourceMappingURL=DbClient.js.map