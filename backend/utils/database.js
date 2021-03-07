const
	mongoClient = require("mongodb").MongoClient,
	MONGO_CONNECTION_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true },
	MONGO_URL = "mongodb://localhost:27017/";

/**
 * @callback MongoDispatcherCallback
 * @param {import("mongodb").Db} iDB 
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
		 * @type {import("mongodb").Db}
		 */
		this.DB = null;


		/**
		 * @private
		 * @type {{[eventName: string]: MongoDispatcherCallback[]}}
		 */
		this.events = {};


		mongoClient.connect(MONGO_URL, MONGO_CONNECTION_OPTIONS, (mongoError, mongoConnection) => {
			if (mongoError) {
				console.error("Error with connection to MongoDB on start-up");
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
	 * @param {String} iEventName
	 * @param {MongoDispatcherCallback} iOnEventHandler
	 * @returns {void}
	 */
	on(iEventName, iOnEventHandler) {
		if (!this.events[iEventName] || !(this.events[iEventName] instanceof Array))
			this.events[iEventName] = [];

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
	 * @returns {Promise<import("mongodb").Db>}
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
