const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{ LOGGING_PORT, LOGGING_TAG } = DEV ? require("../../DEV_CONFIGS/scrapper.config.json") : require("./scrapper.config.json"),
	NodeFetch = require("node-fetch");


/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
const Logging = (...args) => {
	const payload = {
		error: args.findIndex((message) => message instanceof Error) > -1,
		args: args,
		tag: LOGGING_TAG
	};

	NodeFetch(`http://127.0.0.1:${LOGGING_PORT}`, {
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

module.exports = Logging;