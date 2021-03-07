const
	fs = require("fs"),
	{ createReadStream } = fs,
	util = require("util"),
	fsStat = util.promisify(fs.stat),
	fsReadfile = util.promisify(fs.readFile),
	{ join } = require("path");

const
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
 * @type {String[]}
 */
const PAGES = [
	"/",
	"/about"
];
/**
 * Back-end Modules
 * @type {String[]}
 */
const BACKEND_PAGES = [
	"/about"
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
	}
];


/** @typedef {import("./utils/urls-and-cookies")} ModuleCallingObjectType */
const UTIL = require("./utils/urls-and-cookies");


https.createServer(HTTPS_SERVER_OPTIONS, (req, res) => {
	const pathname = UTIL.SafeDecode(new URL(req.url, `https://${HOSTNAME}`).pathname),
		  path = UTIL.ParsePath(pathname),
		  queries = UTIL.ParseQuery(new URL(req.url, `https://${HOSTNAME}`).search),
		  cookies = UTIL.ParseCookie(req.headers);

	
	let location = join(FRONT_ROOT, UTIL.SafeDecode(pathname)),
		backendChecker = false,
		pageChecker = false,
		pageModule = null;

	res.setHeader("Content-Type", "charset=UTF-8");


	const GlobalError404 = () => {
		res.statusCode = 404;
		res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
		res.end(
			`<html><head><meta charset="UTF-8"><meta name="theme-color" content="#FFFFFF"><meta name="viewport" content="user-scalable=no, width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0"><link rel="shortcut icon" href="/favicon.ico"><title>404</title><style>body{background-color:#FAFAFA;color:#333;margin:0;padding:0;}*{text-align:center;}h1{font-family:'Roboto','Noto',Arial,Helvetica,sans-serif;font-weight:400;font-size:56px;padding:0;margin:24px 0;letter-spacing:-.02em;line-height:1.35em;color:inherit;}a{color:#00695C;text-decoration:underline;font-family:'Roboto','Noto',Arial,Helvetica,sans-serif;font-size:24px;font-weight:500;line-height:32px;margin:24px 0 16px;}::selection{background:#B3D4FC;}.is-dark{background-color:#333;color:#DDD;}.is-dark a{color:#4DB6AC}</style></head><body><h1 id="t1">Ошибка 404!</h1><h1 id="t2">Страница не найдена</h1><a id="alink" href="https://${HOSTNAME}">На главную</a><script>if(new Date().getHours()>=19||new Date().getHours()<=6)document.body.classList.add("is-dark");document.getElementById("alink").setAttribute("href",window.location.origin);if(!/ru/gi.test(navigator.language)){document.getElementById("t1").innerText="Error 404!";document.getElementById("t2").innerText="Page not found";document.getElementById("alink").innerText="Home page";};</script></body></html>`
		);
	};

	/**
	 * @param {Number} iCode
	 * @param {String | Buffer | Object} iData 
	 * @returns {false}
	 */
	const GlobalSendCustom = (iCode, iData) => {
		res.statusCode = iCode;

		if (typeof iData === "object") {
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".json"));
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


	if (pathname === "/index.html" || pathname === "/index.php" || pathname === "/index") {
		res.statusCode = 301;
		res.setHeader("Location", "/");
		res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
		res.end(`<html><head><script>window.location="/";location.assign("/");</script></head></html>`);
		return false;
	};
	
	
	if (pathname === "/" | pathname === "") {
		backendChecker = true;
		res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
		pageModule = require("./pages/index");
	};


	PAGES.forEach((item) => {
		if (pathname === item | pathname === item + "/") {
			location = join(location, "index.html");
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
			pageChecker = true;
		} else if (pathname === item + "/index.html") {
			res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
			pageChecker = true;
		};
	});

	BACKEND_PAGES.forEach((item) => {
		const backendRegexp = new RegExp(`^${item}(\/.*)?$`, "");

		if (backendRegexp.test(pathname)) {
			backendChecker = true;
			pageModule = require(`./pages${item}.js`);
		};
	});



	let redirectionChecker = false;

	REDIRECTIONS.findIndex((redir) => {
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



	/** @type {ModuleCallingObjectType} */
	const CALLING_PROPS = {
		req, res,
		pathname,
		path,
		location,
		pageChecker,
		queries,
		cookies,
		GlobalError404,
		GlobalSend,
		GlobalSendCustom
	};


	if (/^\/api\//i.test(pathname)) {
		const API_MODULE = require("./pages/api");

		API_MODULE(CALLING_PROPS);

		return;
	};



	fsStat(location).then((fileStats) => {
		const { size } = fileStats;

		if (size > 1e6 & !backendChecker) {
			try {
				const rangeHeader = req.headers.range;

				if (rangeHeader) {
					const parts = rangeHeader.replace(/bytes=/i, "").split("-"),
						  start = parseInt(parts[0]) || 0,
						  end = parseInt(parts[1]) || size - 1,
						  chunkSize = end - start + 1;
						
					res.statusCode = 206;
					res.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + size);
					res.setHeader("Accept-Ranges", "bytes");
					res.setHeader("Content-Length", chunkSize);
					res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(location));
					createReadStream(location, { start, end }).pipe(res);
				} else {
					res.statusCode = 200;
					res.setHeader("Content-Length", size);
					res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(location));
					createReadStream(location).pipe(res);
				};
			} catch (e) {
				return Promise.reject(e);
			};
		} else {
			return fsReadfile(location).then((data) => {
				res.statusCode = 200;
				if (backendChecker) {
					res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));

					pageModule({
						...CALLING_PROPS,
						data
					});
				} else {
					res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(location));
					res.end(data);
				};
			});
		};
	}).catch(GlobalError404);
}).listen(443, "::");



http.createServer((req, res) => {
	res.statusCode = 301;
	res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".html"));
	res.setHeader("Location", `https://${HOSTNAME}${req.url}`);
	res.end(`<html><head><script>window.location.protocol="https:"</script></head></html>`);
}).listen(80, "::");
