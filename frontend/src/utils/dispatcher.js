const Dispatcher = {
	/** @type {{[eventName: string]: Function[]}} */
	listeners: {},

	/**
	 * @param {String} eventName
	 * @param {Function} eventHandler
	 * @returns {void}
	 */
	link: (eventName, eventHandler) => {
		if (!Dispatcher.listeners[eventName] || !Dispatcher.listeners[eventName].length)
			Dispatcher.listeners[eventName] = [];
		
		Dispatcher.listeners[eventName].push(eventHandler);
	},

	/**
	 * @param {String} eventName
	 * @param {Function} eventHandler
	 * @returns {void}
	 */
	unlink: (eventName, eventHandler) => {
		if (!Dispatcher.listeners[eventName] || !Dispatcher.listeners[eventName].length)
			return;

		const indexOfExistingHandler = Dispatcher.listeners[eventName].indexOf(eventHandler);
		if (indexOfExistingHandler > -1) Dispatcher.listeners[eventName].splice(indexOfExistingHandler, 1);
	},

	/**
	 * @param {String} eventName
	 * @param {Array} argsForHandler
	 * @returns {void}
	 */
	call: (eventName, ...argsForHandler) => {
		if (!Dispatcher.listeners[eventName] || !Dispatcher.listeners[eventName].length)
			Dispatcher.listeners[eventName] = [];

		Dispatcher.listeners[eventName].forEach((eventHandler) => eventHandler(...argsForHandler));
	}
}

export default Dispatcher;
