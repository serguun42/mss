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
