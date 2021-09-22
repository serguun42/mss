export = MongoDispatcher;
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
declare class MongoDispatcher {
    /**
     * @param {string} iDatabaseName
     */
    constructor(iDatabaseName: string);
    /**
     * @private
     * @type {DB}
     */
    private DB;
    /**
     * @private
     * @type {{[eventName: string]: MongoDispatcherCallback[]}}
     */
    private events;
    /**
     * @param {string} iEventName
     * @param {MongoDispatcherCallback} iOnEventHandler
     * @returns {void}
     */
    on(iEventName: string, iOnEventHandler: MongoDispatcherCallback): void;
    /**
     * @param {string} iEventName
     * @returns {void}
     */
    off(iEventName: string): void;
    /**
     * @param {string} iEventName
     * @returns {void}
     */
    dispatchEvent(iEventName: string): void;
    /**
     * @returns {void}
     */
    closeConnection(): void;
    /**
     * @returns {Promise<DB>}
     */
    callDB(): Promise<DB>;
}
declare namespace MongoDispatcher {
    export { DB, MongoDispatcherCallback };
}
type MongoDispatcherCallback = (iDB: import("mongodb").Db) => void;
type DB = import("mongodb").Db;
