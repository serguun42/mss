const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		LOGGING_PORT,
		REMOTE_LOGS_TAG,
		LOGGING_TAG
	} = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json"),
	fetch = require("node-fetch").default;


/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
const Logging = (...args) => {
	const payload = {
		error: args.findIndex((message) => message instanceof Error) > -1,
		args: args.map((arg) => arg instanceof Error ? { ERROR_name: arg.name, ERROR_message: arg.message } : arg),
		tag: LOGGING_TAG
	};

	fetch(`http://127.0.0.1:${LOGGING_PORT}`, {
		method: "POST",
		body: JSON.stringify(payload)
	}).then((res) => {
		if (res.status !== 200)
			return res.text().then((text) => {
				console.warn(new Date());
				console.warn(`Status code = ${res.status}`);
				console.warn(text);
			});
	}).catch((e) => {
		console.warn(new Date());
		console.warn(e);
	});
};

/**
 * @param {String} customTag
 * @param {(Error | String)[]} args
 * @returns {void}
 */
const LoggingWithCustomTag = (customTag, ...args) => {
	const payload = {
		error: args.findIndex((message) => message instanceof Error) > -1,
		args: args.map((arg) => arg instanceof Error ? { ERROR_name: arg.name, ERROR_message: arg.message } : arg),
		tag: customTag
	};

	fetch(`http://127.0.0.1:${LOGGING_PORT}`, {
		method: "POST",
		body: JSON.stringify(payload)
	}).then((res) => {
		if (res.status !== 200)
			return res.text().then((text) => {
				console.warn(new Date());
				console.warn(`Status code = ${res.status}`);
				console.warn(text);
			});
	}).catch((e) => {
		console.warn(new Date());
		console.warn(e);
	});
};

/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
const WrapperForLoggingWithCustomTag = (...args) => LoggingWithCustomTag(REMOTE_LOGS_TAG, ...args);

module.exports = DEV ? console.log : Logging;
module.exports.WithCustomTag = DEV ? console.log : WrapperForLoggingWithCustomTag;
