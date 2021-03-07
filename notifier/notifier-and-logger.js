const
	http = require("http"),
	GetStatusCodes =
	/**
	 * @param {{[code: string]: string}} iStatusCodes
	 * @returns {{[code: number]: string}}
	 */
	(iStatusCodes) => {
		const newCodes = {};

		Object.keys(iStatusCodes).forEach((code) => newCodes[code] = `${code} ${iStatusCodes[code]}`)

		return newCodes;
	},
	STATUSES = GetStatusCodes(http.STATUS_CODES),


	Telegraf = require("telegraf"),


	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		TELEGRAM_BOT_TOKEN,
		TELEGRAM_SYSTEM_CHANNEL,
		LOGGING_PORT
	} = DEV ? require("../../DEV_CONFIGS/notifier-and-logger.config.json") : require("./notifier-and-logger.config.json");



const telegraf = TELEGRAM_BOT_TOKEN ? new Telegraf.Telegraf(TELEGRAM_BOT_TOKEN) : {};
const telegram = TELEGRAM_BOT_TOKEN ? telegraf.telegram : null;



/**
 * @param {String} iReqHeaders
 * @returns {{[name: string]: string}}
 */
const GlobalParseCookie = iReqHeaders => {
	if (!iReqHeaders.cookie) return {};

	const returningList = {},
		  cookies = iReqHeaders.cookie;

	cookies.split(";").forEach((cookie) => {
		const parts = cookie.split("="),
			  cookieName = parts.shift().trim(),
			  cookieValue = parts.join("=");

		try {
			returningList[cookieName] = decodeURIComponent(cookieValue);
		} catch (e) {
			returningList[cookieName] = cookieValue;
		};
	});

	return returningList;
};

/**
 * @param {String} iQuery
 * @returns {Object.<string, (string|true)>}
 */
const GlobalParseQuery = iQuery => {
	if (!iQuery) return {};

	const returningList = {};

	iQuery.toString().replace(/^\?/, "").split("&").forEach((queryPair) => {
		try {
			if (queryPair.split("=")[1])
				returningList[queryPair.split("=")[0]] = decodeURIComponent(queryPair.split("=")[1]);
			else
				returningList[queryPair.split("=")[0]] = true;
		} catch (e) {
			returningList[queryPair.split("=")[0]] = (queryPair.split("=")[1] || true);
		};
	});

	return returningList;
};

/**
 * 
 * @param {String} iString
 * @returns {String}
 */
const SafeDecode = iString => {
	if (typeof iString !== "string") return iString;

	try {
		const decoded = decodeURIComponent(iString);
		return decoded;
	} catch (e) {
		return iString;
	};
};

/**
 * @typedef {Object} NotifierRegularPayload
 * @property {Boolean} error
 * @property {String[]} args
 * @property {String} tag
 * 
 * @typedef {NotifierRegularPayload | String} NotifierPayloadType
 */
/**
 * @param {NotifierPayloadType | Error} payload
 * @returns {void}
 */
const LogViaConsole = (payload) => {
	if (payload instanceof Error) {
		console.error(new Date());
		console.error(payload);
		console.error("~~~~~~~~~~~\n");
	} else if (typeof payload === "string") {
		const out = (/error/gi.test(payload) ? console.error : console.log);

		out(new Date());
		out(payload);
		out("~~~~~~~~~~~\n");
	} else {
		const out = (payload.error ? console.error : console.log);

		out(new Date());

		if (payload.tag) out(`Tag: #${payload.tag}`);

		if (payload.args && payload.args instanceof Array)
			payload.args.forEach((message) => out(message));
		else
			out(payload);

		out("~~~~~~~~~~~\n");
	};
};

/**
 * @param {String} iStringToEscape
 * @returns {String}
 */
const TGE = iStringToEscape => {
	if (!iStringToEscape) return "";
	
	if (typeof iStringToEscape === "string")
		return iStringToEscape
			.replace(/\&/g, "&amp;")
			.replace(/\</g, "&lt;")
			.replace(/\>/g, "&gt;");
	else
		return TGE(iStringToEscape.toString());
};

/**
 * @param {String} iStringToUnescape
 * @returns {String}
 */
const TGUE = iStringToUnescape => {
	if (!iStringToUnescape) return "";
	
	if (typeof iStringToUnescape === "string")
		return iStringToUnescape
			.replace(/&quot;/g, '"')
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&");
	else
		return TGUE(iStringToUnescape.toString());
};

/**
 * @param {NotifierPayloadType} payload
 * @returns {void}
 */
const LogViaTelegram = (payload) => {
	if (!telegram || !TELEGRAM_SYSTEM_CHANNEL) return;

	new Promise((resolve) => {
		if (typeof payload === "string") {
			resolve(`${TGE(payload.toString())}\n\n${/error/gi.test(payload) ? "#error" : "#logs"} #unknown`);
		} else {
			resolve(`${payload.args && payload.args instanceof Array ? TGE(payload.args.join("\n")) : `<pre>${TGE(JSON.stringify(payload))}</pre>`}\n\n${[payload.tag].concat(payload.error ? "error" : "logs").filter(tag => !!tag).map(tag => `#${tag}`).join(" ")}`);
		};
	})
	.then((messageToSend) => telegram.sendMessage(TELEGRAM_SYSTEM_CHANNEL, messageToSend, {
		disable_notification: true,
		disable_web_page_preview: true,
		parse_mode: "HTML"
	}))
	.catch((e) => {
		LogViaConsole({
			error: true,
			args: ["On LogViaTelegram promise catch handler.", "Reason", e],
			tag: "notifieritself"
		});
	});
};

/**
 * @param {NotifierPayloadType} payload
 * @returns {void}
 */
const GenericLog = (payload) => {
	if (typeof payload === "string") {
		if (/error/gi.test(payload) || DEV) LogViaConsole(payload);

		if (!DEV) LogViaTelegram(payload);
	} else {
		if (payload?.error || DEV) LogViaConsole(payload);

		if (!DEV) LogViaTelegram(payload);
	};
};


if (TELEGRAM_BOT_TOKEN) telegraf.launch();

const server = http.createServer((req, res) => {
	/**
	 * @param {Number} iCode
	 * @param {String | Buffer | Object} iData 
	 * @returns {false}
	 */
	const GlobalSendCustom = (iCode, iData) => {
		res.statusCode = iCode;

		if (typeof iData === "object") {
			res.setHeader("Content-Type", "application/json; charset=UTF-8");
			res.end(JSON.stringify(iData))
		} else {
			res.end(iData.toString());
		};

		return false;
	};

	/**
	 * @param {Number} iCode
	 * @returns {false}
	 */
	const GlobalSend = iCode => {
		res.statusCode = iCode || 200;
		res.end(STATUSES[iCode || 200]);
		return false;
	};


	if (req.method === "POST") {
		new Promise((resolve, reject) => {
			const chunks = [];

			req.on("data", (chunk) => chunks.push(chunk));

			req.on("error", (e) => reject(e));

			req.on("end", () => resolve(Buffer.concat(chunks)));
		}).then(/** @param {Buffer} iRequestBuffer */ (iRequestBuffer) => {
			const payloadString = iRequestBuffer.toString();

			try {
				const payloadParsed = JSON.parse(payloadString);

				GenericLog(payloadParsed);
			} catch (e) {
				GenericLog(payloadString);
			};

			GlobalSendCustom(200, { wrote: true });
		}).catch((e) => {
			LogViaConsole({
				error: true,
				args: ["On POST-method promise catch handler.", "Reason", e],
				tag: "notifieritself"
			});

			GlobalSend(500);
		});
	} else {
		const queries = GlobalParseQuery(new URL(req.url, "https://mss.serguun42.ru").search);


		const error = !!queries["error"],
			  args = queries["args"] || queries["message"] || queries["messages"],
			  tag = queries["tag"];

		try {
			const parsedArgs = JSON.parse(args);

			GenericLog({
				error,
				args: (parsedArgs instanceof Array ? parsedArgs : [parsedArgs]),
				tag: tag || "unknown"
			});
		} catch (e) {
			GenericLog({
				error,
				args: [args],
				tag: tag || "unknown"
			});
		};


		GlobalSendCustom(200, { wrote: true });
	};
});

server.listen(LOGGING_PORT);




process.on("unhandledRejection", (reason, p) => {
	LogViaConsole({
		error: true,
		args: ["Unhandled Rejection", p, reason],
		tag: "notifieritself"
	});
});
