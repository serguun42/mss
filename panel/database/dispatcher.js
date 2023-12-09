import { MongoClient } from "mongodb";
import ReadConfig from "../util/read-config.js";
import Logging from "../util/logging.js";

const MONGO_CONNECTION_URL = ReadConfig().DATABASE_CONNECTION_URI || "mongodb://127.0.0.1:27017/";

/**
 * @callback MongoDispatcherCallback
 * @param {import("mongodb").Db} db
 * @returns {void}
 */

/**
 * @class
 * @classdesc Various events and callbacks for DB
 */
export default class MongoDispatcher {
  /**
   * @param {string} dbName
   */
  constructor(dbName) {
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

    MongoClient.connect(MONGO_CONNECTION_URL, {})
      .then((connectedClient) => {
        this.DB = connectedClient.db(dbName);

        this.on("close", () => {
          this.DB = null;
          connectedClient.close();
        });
      })
      .catch((e) => {
        Logging("Error with connection to MongoDB on start-up", mongoError);
      });
  }

  /**
   * @param {string} eventName
   * @param {MongoDispatcherCallback} eventHandler
   * @returns {void}
   */
  on(eventName, eventHandler) {
    if (!this.events[eventName] || !(this.events[eventName] instanceof Array)) this.events[eventName] = [];

    this.events[eventName].push(eventHandler);
  }

  /**
   * @param {string} eventName
   * @returns {void}
   */
  off(eventName) {
    delete this.events[eventName];
  }

  /**
   * @param {string} eventName
   * @returns {void}
   */
  dispatchEvent(eventName) {
    if (this.events[eventName] && this.events[eventName] instanceof Array)
      this.events[eventName].forEach((eventHandler) => {
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
   * @returns {Promise<import('mongodb').Db>}
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
