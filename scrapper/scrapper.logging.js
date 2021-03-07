const
	fs = require("fs"),
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV";

/**
 * @param  {(Error | String)[]} args
 * @returns {void}
 */
const TelegramLogSystem = (...args) => {
	// I do nothing yet!
};

/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
const LogMessageOrError = (...args) => {
	const containsAnyError = (args.findIndex((message) => message instanceof Error) > -1),
		  out = (containsAnyError ? console.error : console.log);

	out(new Date());
	args.forEach((message) => out(message));
	out("~~~~~~~~~~~\n\n");


	if (DEV)
		fs.writeFile("./out/logmessageorerror.json", JSON.stringify([...args], false, "\t"), () => {});
	else
		TelegramLogSystem(...args);
};

module.exports = LogMessageOrError;
