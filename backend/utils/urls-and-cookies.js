const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{ HOSTNAME } = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json");

/**
 * MIME-Type accordance for different file formats
 * @type {{format: String, type: String, noCharset?: Boolean}[]}
 */
const TYPES_ACCORDANCE = [
	{ format: "mp4", type: "video/mp4", noCharset: true },
	{ format: "mpeg", type: "video/mpeg", noCharset: true },
	{ format: "mkv", type: "video/x-matroska", noCharset: true },
	{ format: "avi", type: "video/x-msvideo", noCharset: true },
	{ format: "mp3", type: "audio/mp3", noCharset: true },
	{ format: "aac", type: "audio/aac", noCharset: true },
	{ format: "ac3", type: "audio/ac3", noCharset: true },
	{ format: "wav", type: "audio/wav", noCharset: true },
	{ format: "flac", type: "audio/flac", noCharset: true },
	{ format: "ape", type: "audio/x-monkeys-audio", noCharset: true },
	{ format: "txt", type: "text/plain" },
	{ format: "html", type: "text/html" },
	{ format: "js", type: "application/javascript" },
	{ format: "vue", type: "application/javascript" },
	{ format: "json", type: "application/json" },
	{ format: "webmanifest", type: "application/json" },
	{ format: "yaml", type: "text/yaml" },
	{ format: "css", type: "text/css" },
	{ format: "xml", type: "text/xml" },
	{ format: "jpeg", type: "image/jpeg", noCharset: true },
	{ format: "jfif", type: "image/jpeg", noCharset: true },
	{ format: "jpg", type: "image/jpeg", noCharset: true },
	{ format: "png", type: "image/png", noCharset: true },
	{ format: "gif", type: "image/gif", noCharset: true },
	{ format: "psd", type: "image/psd", noCharset: true },
	{ format: "ico", type: "image/x-icon", noCharset: true },
	{ format: "webp", type: "image/webp", noCharset: true },
	{ format: "svg", type: "image/svg+xml" },
	{ format: "woff2", type: "font/woff2", noCharset: true },
	{ format: "woff", type: "font/woff", noCharset: true },
	{ format: "ttf", type: "font/ttf", noCharset: true },
	{ format: "srt", type: "text/plain" },
	{ format: "vtt", type: "text/vtt" },
	{ format: "zip", type: "application/zip", noCharset: true },
	{ format: "pdf", type: "application/pdf" },
];

/**
 * @param {String} iString
 * @returns {String}
 */
const SafeDecode = iString => {
	if (typeof iString !== "string") return iString;

	try {
		const decoded = decodeURIComponent(iString);
		return SafeEscape(decoded);
	} catch (e) {
		return SafeEscape(iString);
	};
};

/**
 * @param {String} iString
 * @returns {String}
 */
const SafeEscape = iString => {
	if (typeof iString !== "string") return iString;

	return iString
				.replace(/(\/+)/gi, "/")
				.replace(/\.\.\%2F/gi, "")
				.replace(/\.\.\//g, "");
};

/**
 * @param {String} iReqHeaders
 * @returns {{[name: string]: string}}
 */
const ParseCookie = iReqHeaders => {
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
 * @param {String | String[]} iPath
 * @returns {String[]}
 */
const ParsePath = iPath => {
	if (iPath instanceof Array) {
		if (iPath.every(part => typeof part == "string"))
			return [].concat(...iPath.map((part) => part.split("/"))).filter(part => !!part);
		else
			return iPath;
	} else if (typeof iPath == "string")
		return iPath.replace().split("/").filter(part => !!part);
	else
		return iPath;
};

/**
 * @param {String} iQuery
 * @returns {{[queryName: string]: string | true}}
 */
const ParseQuery = iQuery => {
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
 * @param {{[queryName: string]: string | true}} iQueries
 * @returns {String}
 */
const CombineQueries = iQueries => {
	if (typeof iQueries !== "object") return "";
	if (!Object.keys(iQueries).length) return "";
	
	return "?" + Object.keys(iQueries).map((key) => iQueries[key] === true ? key : `${key}=${encodeURIComponent(iQueries[key])}`).join("&");
};

/**
 * @param {String} iPathname
 * @returns {URL}
 */
const SafeURL = iPathname => {
	if (typeof iPathname !== "string") return new URL("/", `https://${HOSTNAME}`);

	return new URL(iPathname.replace(/\/+/g, "/"), `https://${HOSTNAME}`);
};

/**
 * @param {String} iLoc
 * @returns {String}
 */
const SetMIMEType = iLoc => {
	const filename = iLoc.toString().split("/").pop(),
		  index = TYPES_ACCORDANCE.findIndex((type) => type.format === filename.split(".").pop());

	if (!filename.match(/\./))
		return "text/plain";
	else if (index > -1)
		return TYPES_ACCORDANCE[index].type;
	else
		return filename.split(".").pop();
};

/**
 * @param {String} iLoc
 * @returns {String}
 */
const SetCompleteMIMEType = iLoc => {
	const filename = iLoc.toString().split("/").pop(),
		  index = TYPES_ACCORDANCE.findIndex((type) => type.format === filename.split(".").pop());

	if (!filename.match(/\./))
		return "text/plain";
	else if (index > -1) {
		if (TYPES_ACCORDANCE[index].noCharset)
			return TYPES_ACCORDANCE[index].type;
		else
			return TYPES_ACCORDANCE[index].type + "; charset=UTF-8";
	} else
		return filename.split(".").pop();
};



/**
 * @typedef {Object} UTIL
 * @property {(iString: String) => String} SafeDecode - Example `UTIL.SafeDecode(UTIL.SafeURL(req.url).pathname)`
 * @property {(iString: String) => String} SafeEscape - Example `UTIL.SafeEscape(pathname)`
 * @property {(iPathname: String) => URL} SafeURL - Example `UTIL.SafeURL(req.url)`
 * @property {{iHeaders: {[headerName: string]: string}} => {[name: string]: string}} ParseCookie - Example `UTIL.ParseCookie(req.headers)`
 * @property {(iPath: String) => String[]} ParsePath - Example `UTIL.ParsePath(pathname)`
 * @property {(iQuery: String) => {[queryName: string]: string | true}} ParseQuery - Example `UTIL.ParseQuery(UTIL.SafeURL(req.url).search)`
 * @property {(iQueries: {[queryName: string]: string | true}) => String} CombineQueries - Example `UTIL.CombineQueries({ pass: true, search: "Seeking group" })`
 * @property {(iExtention: String) => String} SetMIMEType
 * @property {(iExtention: String) => String} SetCompleteMIMEType
 */
/**
 * @type {UTIL}
 */
module.exports = {
	SafeDecode,
	SafeEscape,
	SafeURL,
	ParseCookie,
	ParsePath,
	ParseQuery,
	CombineQueries,
	SetMIMEType,
	SetCompleteMIMEType,
}
