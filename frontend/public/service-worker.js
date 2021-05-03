const
	CACHE = "cache_static",
	Highlight = iString => `\u001b[33m ${iString} \u001b[0m`,
	Accent = iString => `\u001b[35m ${iString} \u001b[0m`;


self.addEventListener("install", (e) => {
	console.log(Accent("<install> event"));

	function onInstall() {
		return caches.open(CACHE)
			.then(cache => cache.addAll([
				"/",
				"/all",
				"/group",
				"/app"
			]));
	};

	e.waitUntil(onInstall(e));
});

self.addEventListener("activate", (e) => {
	console.log(Accent("<activate> event"));
});

self.addEventListener("beforeinstallprompt", () => {
	console.log(Accent("<beforeinstallprompt> event"));
});



/**
 * @typedef {Object.<String>} FetchEvent~Event
 * @property {String} clientId
 * @property {Promise} preloadResponse
 * @property {Request} request
 * @property {String} replacesClientId
 * @property {String} resultingClientId
 */

/**
 * **From Network** _with putting into Cache_
 * 
 * @param {Request} request
 */
function fromNetwork(request) {
	const requestedURL = new URL(request.url);
	let putToCacheChecker = false;

	[
		/^\/manifest.json/g,
		/^\/manifest.webmanifest/g,
		/\.(woff2|woff|ttf|js|css)$/g,
		/^\/img\/icons\/(round|maskable)\/(round|maskable)_(\d+x\d+)\.png$/g
	].forEach((iRegExp) => {
		if (iRegExp.test(requestedURL.pathname)) {
			putToCacheChecker = true;
		};
	});

	if (putToCacheChecker)
		return new Promise((resolve, reject) => {
			caches.open(CACHE).then((cache) =>
				fetch(request).then((response) =>
					cache.put(request, response).then(() =>
						fromCache(request).then((matching) => resolve(matching))
					)
				)
			)
		});
	else
		return fetch(request);
};

/**
 * **From Cache**
 * 
 * @param {Request} request
 */
function fromCache(request) {
	return caches.open(CACHE)
		.then((cache) => cache.match(request))
		.then((matching) => {
			if (matching)
				return matching;
			else
				return Promise.reject("no-match");
		});
};

self.addEventListener("fetch", /** @param {FetchEvent|Event} fetchEvent */ (fetchEvent) => {
	const { request } = fetchEvent;

	fetchEvent.respondWith(
		fromCache(request)
			.catch(() => fromNetwork(request))
	);
});
