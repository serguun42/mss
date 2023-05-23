const
	Logging = require("./logging"),
	{ DATABASE_CONNECTION_URI } = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json"),
	mongoClient = require("mongodb").MongoClient,
	MONGO_CONNECTION_OPTIONS = {},
	MONGO_URL = DATABASE_CONNECTION_URI || "mongodb://127.0.0.1:27017/";

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
	 * @param {string} iDatabaseName
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
			};
		});
	}



	/**
	 * @param {string} iEventName
	 * @param {MongoDispatcherCallback} iOnEventHandler
	 * @returns {void}
	 */
	on(iEventName, iOnEventHandler) {
		if (!this.events[iEventName] || !(this.events[iEventName] instanceof Array))
			this.events[iEventName] = [];

		this.events[iEventName].push(iOnEventHandler);
	}

	/**
	 * @param {string} iEventName
	 * @returns {void}
	 */
	off(iEventName) {
		delete this.events[iEventName];
	}

	/**
	 * @param {string} iEventName
	 * @returns {void}
	 */
	dispatchEvent(iEventName) {
		if (this.events[iEventName] && this.events[iEventName] instanceof Array)
			this.events[iEventName].forEach((eventHandler) => {
				if (typeof eventHandler == "function")
					eventHandler(this.DB);
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
				};
			});
		})
	}
};

module.exports = MongoDispatcher;
