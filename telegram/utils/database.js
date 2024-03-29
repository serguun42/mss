const Logging = require("./logging");
const DEV = require("os").platform() === "win32" || process.argv[2] === "DEV";
const { DATABASE_CONNECTION_URI } = DEV
  ? require("../../../DEV_CONFIGS/telegram-bot.config.json")
  : require("../telegram-bot.config.json");
const mongoClient = require("mongodb").MongoClient;
const MONGO_CONNECTION_OPTIONS = {};
const MONGO_URL = DATABASE_CONNECTION_URI || "mongodb://127.0.0.1:27017/";

/**
 * @typedef {import("mongodb").Db} DB
 */
/**
 * @callback MongoDispatcherCallback
 * @param {DB} iDB
 * @returns {void}
 */
/**
 * @class
 * @classdesc Various events and callbacks for DB
 */
class MongoDispatcher {
  /**
   * @param {String} iDatabaseName
   */
  constructor(iDatabaseName) {
    /**
     * @private
     * @type {DB}
     */
    this.DB = null;

    /**
     * @private
     * @type {{[eventName: string]: MongoDispatcherCallback[]}}
     */
    this.events = {};

    mongoClient.connect(MONGO_URL, MONGO_CONNECTION_OPTIONS, (mongoError, mongoConnection) => {
      if (mongoError) {
        Logging("Error with connection to MongoDB on start-up", mongoError);
      } else {
        this.DB = mongoConnection.db(iDatabaseName);

        this.on("close", () => {
          this.DB = null;
          mongoConnection.close();
        });
      }
    });
  }

  /**
   * @param {String} iEventName
   * @param {MongoDispatcherCallback} iOnEventHandler
   * @returns {void}
   */
  on(iEventName, iOnEventHandler) {
    if (!this.events[iEventName] || !(this.events[iEventName] instanceof Array)) this.events[iEventName] = [];

    this.events[iEventName].push(iOnEventHandler);
  }

  /**
   * @param {String} iEventName
   * @returns {void}
   */
  off(iEventName) {
    delete this.events[iEventName];
  }

  /**
   * @param {String} iEventName
   * @returns {void}
   */
  dispatchEvent(iEventName) {
    if (this.events[iEventName] && this.events[iEventName] instanceof Array)
      this.events[iEventName].forEach((eventHandler) => {
        if (typeof eventHandler == "function") eventHandler(this.DB);
      });
  }

  /**
   * @returns {void}
   */
  closeConnection() {
    this.dispatchEvent("close");
  }

  /**
   * @returns {Promise<DB>}
   */
  callDB() {
    return new Promise((resolve) => {
      if (this.DB) return resolve(this.DB);

      const waitingInterval = setInterval(() => {
        if (this.DB) {
          clearInterval(waitingInterval);
          resolve(this.DB);
        }
      });
    });
  }
}

module.exports = MongoDispatcher;
