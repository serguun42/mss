const
	{ join } = require("path"),
	fs = require("fs"),
	util = require("util"),
	{ createReadStream: fsCreateReadStream, ReadStream: fsReadStream } = fs,
	fsStat = util.promisify(fs.stat),
	zlib = require("zlib"),
	{ createGzip } = zlib,
	gzip = util.promisify(zlib.gzip);

const
	LOG_CONNECTIONS = false,
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		DATABASE_NAME,
		CERTS,
		FRONT_ROOT,
		HOSTNAME
	} = DEV ? require("../../DEV_CONFIGS/backend.config.json") : require("./backend.config.json");


const
	http = require("http"),
	https = require("https");
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
const HTTPS_SERVER_OPTIONS = {
	key: fs.readFileSync(CERTS.key),
	cert: fs.readFileSync(CERTS.cert)
};
/**
 * Usual Front-end Pages
 * @type {(String | RegExp)[]}
 */
const PAGES = [
	"/",
	"/about",
	"/all",
	"/app",
	/^\/group$/,
	/^\/group\//,
	/^\/docs\/api(\/(swagger(\/)?)?)?$/
];
/**
 * URLs with redirection
 * @type {{required: String | RegExp, redirect: String, savePathname?: Boolean, exceptions?: (String | RegExp)[]}[]}
 */
const REDIRECTIONS = [
	{
		required: /\.psd$/,
		redirect: "https://mirea.xyz/",
		savePathname: false
	},
	{
		required: /^\/docs\/api\/redoc(\/)?$/,
		redirect: "/docs/api/redoc.html",
		savePathname: false
	}
];


const UTIL = require("./utils/urls-and-cookies");


https.createServer(HTTPS_SERVER_OPTIONS, (req, res) => {
	const pathname = UTIL.SafeDecode(new URL(req.url, `https://${HOSTNAME}`).pathname),
		  path = UTIL.ParsePath(pathname),
		  queries = UTIL.ParseQuery(new URL(req.url, `https://${HOSTNAME}`).search),
		  cookies = UTIL.ParseCookie(req.headers),
		  acceptGzip = /\bgzip\b/i.test(req.headers["accept-encoding"] || "");

	
	let location = join(FRONT_ROOT, UTIL.SafeDecode(pathname)),
		pageChecker = false,
		pageModule = null;

	res.setHeader("Content-Type", "charset=UTF-8");


	const GlobalError404 = () => {
		res.statusCode = 404;
		res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
		res.end(`<html><head><meta charset="UTF-8"><meta name="theme-color" content="#FFFFFF"><meta name="viewport" content="user-scalable=no, width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0"><link rel="shortcut icon" href="/favicon.ico"><title>404</title><style>body{background-color:#FAFAFA;color:#333;margin:0;padding:0;}*{text-align:center;}h1{font-family:'Roboto','Noto',Arial,Helvetica,sans-serif;font-weight:400;font-size:56px;padding:0;margin:24px 0;letter-spacing:-.02em;line-height:1.35em;color:inherit;}a{color:#03589C;text-decoration:underline;font-family:'Roboto','Noto',Arial,Helvetica,sans-serif;font-size:24px;font-weight:500;line-height:32px;margin:24px 0 16px;}::selection{background:#B3D4FC;}.is-dark{background-color:#333;color:#DDD;}.is-dark a{color:#4DB6AC}</style></head><body><h1 id="t1">Ошибка 404!</h1><h1 id="t2">Страница не найдена</h1><a id="alink" href="https://${HOSTNAME}">На главную</a><script>if(new Date().getHours()>=19||new Date().getHours()<=6)document.body.classList.add("is-dark");document.getElementById("alink").setAttribute("href",window.location.origin);if(!/ru/gi.test(navigator.language)){document.getElementById("t1").innerText="Error 404!";document.getElementById("t2").innerText="Page not found";document.getElementById("alink").innerText="Home page";};</script></body></html>`);
	};


	/**
	 * @param {String} [iWhen]
	 */
	const LogConnection = (iWhen = "REQ") => {
		if (!LOG_CONNECTIONS) return;

		console.log(`${(iWhen + ":").padEnd(15, " ")}${decodeURIComponent(req.url).padEnd(50, " ")} ${new Date().toISOString()}`);
	}

	LogConnection("REG");

	/**
	 * @param {Number} iCode
	 * @param {String | Buffer | ReadStream | Object} iData 
	 * @returns {false}
	 */
	const GlobalSendCustom = (iCode, iData) => {
		LogConnection("RES START");

		res.statusCode = iCode;

		if (iData instanceof fsReadStream) {
			if (acceptGzip) {
				res.setHeader("Content-Encoding", "gzip");
				iData.pipe(createGzip()).pipe(res);
			} else {
				res.removeHeader("Content-Encoding");
				iData.pipe(res);
			}
		} else if (iData instanceof Buffer || typeof iData == "string") {
			const dataToSend = iData.toString();
			
			if (acceptGzip) {
				gzip(dataToSend)
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
				gzip(dataToSend)
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
	 * @param {Number} iCode
	 * @returns {false}
	 */
	const GlobalSend = iCode => {
		LogConnection("RES START");

		res.statusCode = iCode || 200;
		res.end(STATUSES[iCode || 200], () => LogConnection("RES END"));
		return false;
	};


	if (pathname === "/index.html" || pathname === "/index.php" || pathname === "/index") {
		res.statusCode = 301;
		res.setHeader("Location", "/");
		res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
		res.end(`<html><head><script>window.location="/";location.assign("/");</script></head></html>`);
		return false;
	};
	
	
	PAGES.forEach((item) => {
		if (
			(
				typeof item == "string" && (
					pathname === item ||
					pathname === item + "/" ||
					pathname === item + "/index.html"
				)
			) || (
				item instanceof RegExp && item.test(pathname)
			)
		) {
			location = join(FRONT_ROOT, "index.html");
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
			pageModule = require("./pages/index");
			pageChecker = true;
		};
	});



	let redirectionChecker = false;

	REDIRECTIONS.forEach((redir) => {
		if (
			(
				typeof redir.required == "string" &&
				(
					pathname === redir.required ||
					pathname === redir.required + "/" ||
					new RegExp(`^${redir.required}/(.*)`, "gi").test(pathname)
				)
			)
			||
			(
				redir.required instanceof RegExp &&
				redir.required.test(pathname)
			)
		) {
			if (redirectionChecker) return false;

			if (redir.exceptions) {
				let exceptionsChecker = false;

				redir.exceptions.forEach((exception) => {
					if (
						(
							typeof exception == "string" &&
							(
								pathname === exception ||
								pathname === exception + "/" ||
								new RegExp(exception + "/(.*)", "gi").test(pathname)
							)
						)
						||
						(
							exception instanceof RegExp &&
							exception.test(pathname)
						)
					)
						exceptionsChecker = true;
				});

				if (exceptionsChecker) return false;
			};

			redirectionChecker = true;

			res.statusCode = 301;
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));

			if (redir.savePathname) {
				res.setHeader("Location", `${redir.redirect}${pathname.slice(redir.required.length)}${UTIL.CombineQueries(queries)}`);
				res.end(`<html><head><script>window.location="${redir.redirect}${pathname.slice(redir.required.length)}${UTIL.CombineQueries(queries)}"+window.location.hash;</script></head></html>`);
			} else {
				res.setHeader("Location", redir.redirect);
				res.end(`<html><head><script>window.location="${redir.redirect}";</script></head></html>"`);
			};
		};
	});

	if (redirectionChecker) return false;


	if (
		location.match(/\.([\w\d]+)$/)?.[0] === ".woff2" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".woff" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".ttf" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".png" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".jpg" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".jpeg" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".ico" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".gif" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".mp4" ||
		location.match(/\.([\w\d]+)$/)?.[0] === ".webm"
	)
		res.setHeader("Cache-Control", "public, max-age=604800");



	/** @type {import("./typings").ModuleCallingObjectType} */
	const CALLING_PROPS = {
		req, res,
		pathname,
		path,
		location,
		pageChecker,
		queries,
		cookies,
		acceptGzip,
		GlobalError404,
		GlobalSend,
		GlobalSendCustom,
		...UTIL
	};


	if (/^\/api\//i.test(pathname)) {
		const API_MODULE = require("./pages/api");

		API_MODULE(CALLING_PROPS);

		return;
	};



	fsStat(location).then((fileStats) => {
		const { size } = fileStats;

		if (!pageChecker) {
			try {
				const rangeHeader = req.headers.range;

				if (rangeHeader && !acceptGzip) {
					const parts = rangeHeader.replace(/bytes=/i, "").split("-"),
						  start = parseInt(parts[0]) || 0,
						  end = parseInt(parts[1]) || size - 1,
						  chunkSize = end - start + 1;

					res.statusCode = 206;
					res.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + size);
					res.setHeader("Accept-Ranges", "bytes");
					res.setHeader("Content-Length", chunkSize);
					res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(location));
					fsCreateReadStream(location, { start, end }).pipe(res);
				} else {
					res.statusCode = 200;
					res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(location));

					if (acceptGzip && size < 5e3) {
						res.removeHeader("Content-Length");
						res.setHeader("Content-Encoding", "gzip");
						fsCreateReadStream(location).pipe(createGzip()).pipe(res);
					} else {
						res.setHeader("Content-Length", size);
						res.removeHeader("Content-Encoding");
						fsCreateReadStream(location).pipe(res);
					}
				}
			} catch (e) {
				return Promise.reject(e);
			}
		} else {
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));

			pageModule({
				...CALLING_PROPS,
				fileStream: fsCreateReadStream(location)
			});
		};
	}).catch(GlobalError404);
}).listen(443, "::");



http.createServer((req, res) => {
	res.statusCode = 301;
	res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
	res.setHeader("Location", `https://${HOSTNAME}${decodeURIComponent(req.url)}`);
	res.end(`<html><head><script>window.location.protocol="https:"</script></head></html>`);
}).listen(80, "::");
