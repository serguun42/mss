const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		LOGGING_PORT,
		LOGGING_TAG
	} = DEV ? require("../../DEV_CONFIGS/ci.config.json") : require("./ci.config.json"),
	NodeFetch = require("node-fetch");


/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
const LoggingCIStuffToNotifier = (...args) => {
	NodeFetch(`http://127.0.0.1:${LOGGING_PORT}`, {
		method: "POST",
		body: JSON.stringify({
			error: false,
			args: args instanceof Array ? [args.join("\n")] : args,
			tag: LOGGING_TAG
		})
	}).then((res) => {
		if (!res.ok)
			return Promise.reject(new Error(`Notified status code ${res.status} ${res.statusCode}`));
	}).catch((e) => {
		console.warn(new Date());
		console.warn(e);
	});
};

if (process.argv && process.argv.length > 2) {
	LoggingCIStuffToNotifier(...process.argv.slice(2));
}
