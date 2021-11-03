const
	{ promisify } = require("util"),
	{ gzip } = require("zlib"),
	gzipPromise = promisify(gzip),
	http = require("http");

const
	LOG_CONNECTIONS = false,
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{ NODE_PORT } = DEV ? require("../../DEV_CONFIGS/backend.config.json") : require("./backend.config.json");

/**
 * @param {{[code: string]: string}} iStatusCodes
 * @returns {{[code: number]: string}}
 */
const GetStatusCodes = (iStatusCodes) => {
	const newCodes = {};

	Object.keys(iStatusCodes).forEach((code) => newCodes[code] = `${code} ${iStatusCodes[code]}`)

	return newCodes;
};

/**
 * HTTP Response Statuses
 * @type {{[code: number]: string}}
 */
const STATUSES = GetStatusCodes(http.STATUS_CODES);

const UTIL = require("./utils/urls-and-cookies");


http.createServer((req, res) => {
	const pathname = UTIL.SafeDecode(UTIL.SafeURL(req.url).pathname),
		  path = UTIL.ParsePath(pathname),
		  queries = UTIL.ParseQuery(UTIL.SafeURL(req.url).search),
		  cookies = UTIL.ParseCookie(req.headers),
		  acceptGzip = /\bgzip\b/i.test(req.headers["accept-encoding"] || "");

	res.setHeader("Content-Type", "charset=UTF-8");


	/**
	 * @param {string} [iWhen]
	 */
	const LogConnection = (iWhen = "REQ") => {
		if (!LOG_CONNECTIONS) return;

		console.log(`${(iWhen + ":").padEnd(15, " ")}${UTIL.SafeDecode(req.url).padEnd(50, " ")} ${new Date().toISOString()}`);
	}

	LogConnection("REG");

	/**
	 * @param {number} iCode
	 * @param {string | Buffer | ReadStream | Object} iData 
	 * @returns {false}
	 */
	const GlobalSendCustom = (iCode, iData) => {
		LogConnection("RES START");

		res.statusCode = iCode;

		if (iData instanceof Buffer || typeof iData == "string") {
			const dataToSend = iData.toString();
			
			if (acceptGzip) {
				gzipPromise(dataToSend)
				.then((compressed) => {
					res.setHeader("Content-Encoding", "gzip");
					res.setHeader("Content-Length", compressed.length);
					res.end(compressed, () => LogConnection("RES END"));
				})
				.catch(() => {
					res.removeHeader("Content-Encoding");
					res.setHeader("Content-Length", dataToSend.length);
					res.end(dataToSend, () => LogConnection("RES END"));
				});
			} else {
				res.removeHeader("Content-Encoding");
				res.setHeader("Content-Length", dataToSend.length);
				res.end(dataToSend, () => LogConnection("RES END"));
			}
		} else {
			const dataToSend = JSON.stringify(iData);
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".json"));

			if (acceptGzip) {
				gzipPromise(dataToSend)
				.then((compressed) => {
					res.setHeader("Content-Encoding", "gzip");
					res.setHeader("Content-Length", compressed.length);
					res.end(compressed, () => LogConnection("RES END"));
				})
				.catch(() => {
					res.removeHeader("Content-Encoding");
					res.setHeader("Content-Length", dataToSend.length);
					res.end(dataToSend, () => LogConnection("RES END"));
				});
			} else {
				res.removeHeader("Content-Encoding");
				res.setHeader("Content-Length", dataToSend.length);
				res.end(dataToSend, () => LogConnection("RES END"));
			}
		}

		return false;
	};

	/**
	 * @param {number} iCode
	 * @returns {false}
	 */
	const GlobalSend = iCode => {
		LogConnection("RES START");

		res.statusCode = iCode || 200;
		res.end(STATUSES[iCode || 200], () => LogConnection("RES END"));
		return false;
	};



	/** @type {import("./types").ModuleCallingObjectType} */
	const CALLING_PROPS = {
		req, res,
		pathname,
		path,
		queries,
		cookies,
		acceptGzip,
		GlobalSend,
		GlobalSendCustom,
		...UTIL
	};


	if (path[0] === "api")
		return require("./pages/api")(CALLING_PROPS);
	else
		return GlobalSend(404);
}).listen(NODE_PORT);
