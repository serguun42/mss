const CACHE_STORAGE_NAME = "cache_static";

self.addEventListener("install", (e) => {
	function onInstall() {
		return caches.open(CACHE_STORAGE_NAME)
			.then(cache => cache.addAll([
				"/",
				"/all",
				"/group",
				"/app",
				"/favicon.ico"
			]));
	};

	e.waitUntil(onInstall(e));
});

self.addEventListener("activate", (e) => { });

self.addEventListener("beforeinstallprompt", () => { });



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
		/^\/api\//i,
		/^\/manifest.json/gi,
		/^\/manifest.webmanifest/gi,
		/\.(woff2|woff|ttf|js|css)$/gi,
		/^\/img\/icons\/(round|maskable)\/(round|maskable)_(\d+x\d+)\.png$/gi
	].forEach((iRegExp) => {
		if (iRegExp.test(requestedURL.pathname)) {
			putToCacheChecker = true;
		};
	});

	if (putToCacheChecker)
		return new Promise((resolve, reject) =>
			caches.open(CACHE_STORAGE_NAME).then((cache) =>
				fetch(request).then((response) =>
					cache.put(request, response).then(() =>
						fromCache(request).then((matching) => resolve(matching))
					).catch(reject)
				).catch(reject)
			).catch(reject)
		);
	else
		return fetch(request);
};

/**
 * **From Cache**
 * 
 * @param {Request} request
 */
function fromCache(request) {
	return caches.open(CACHE_STORAGE_NAME)
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


	let apiCalledFlag = false;

	try {
		const parsedURL = new URL(request.url || "", "https://mirea.xyz");

		if (/^\/api\//i.test(parsedURL.pathname))
			apiCalledFlag = true;
	} catch (e) { };


	if (apiCalledFlag) {
		fetchEvent.respondWith(
			fromNetwork(request)
				.catch(fromCache(request))
		);
	}
	else
		fetchEvent.respondWith(
			fromCache(request)
				.catch(() => fromNetwork(request))
		);
});
