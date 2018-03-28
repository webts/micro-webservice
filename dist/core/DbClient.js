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
    this.client = null;
  }
  /**
   * return connection string
   * @return {string}
   */


  getConnectionUri() {
    let url = `mongodb://${this.options.username}:${this.options.password}@${this.options.host}:${this.options.port || 27301}/${this.dbName}`;

    if (this.options.authSource) {
      url += `?authSource=${this.options.authSource}`;
    }

    return url;
  }

  async find(query) {
    if (this.client) {
      return await this.client.find(query);
    }

    return null;
  }

  async getById(id) {
    if (this.client) {
      return await this.client.find({
        id
      });
    }

    return null;
  }

  database(dbName) {
    this.dbName = dbName;
    return this;
  }
  /**
   * begin a transaction
   * this will open a connection to db
   * @return {Promise.<DbClient>}
   */


  async begin() {
    this.client = await _mongodb.default.MongoClient.connect(this.getConnectionUri());
    this.emit("DbClient:Open", "Open connection " + this.getConnectionUri());
    return this;
  }
  /**
   *
   * @param client {mongo.MongoClient}
   * @return {Promise.<void>}
   */


  async end() {
    await this.client.close();
    this.emit("DbClient:Close", "Closed connection " + this.getConnectionUri());
  }

}

exports.default = DbClient;
//# sourceMappingURL=DbClient.js.map