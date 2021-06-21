const CACHE_STORAGE_NAME = "cache_static_and_dynamic_with_api";

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches
		.open(CACHE_STORAGE_NAME)
		.then(cache => cache.addAll([
			"/",
			"/all",
			"/group",
			"/app",
			"/about",
			"/docs/api",
			"/favicon.ico"
		]))
	);
});

self.addEventListener("activate", () => { });

self.addEventListener("beforeinstallprompt", () => { });



/**
 * **From Network** _with putting into Cache_
 * 
 * @param {Request} request
 */
function fromNetwork(request) {
	const requestedURL = new URL(request.url);
	let putToCacheChecker = false;

	[
		/^(\/?)$/,
		/^\/all(\/?)$/,
		/^\/group(\/?)$/,
		/^\/app(\/?)$/,
		/^\/about(\/?)$/,
		/^\/docs\/api(\/?)$/,
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

self.addEventListener("fetch", /** @param {Event & { request: Request, preloadResponse: Response }} event */ (event) => {
	const { request } = event;

	if (request.method !== "GET") return fetch(request);


	let apiCalledFlag = false;

	try {
		const parsedURL = new URL(request.url || "", "https://mirea.xyz");

		if (/^\/api\//i.test(parsedURL.pathname))
			apiCalledFlag = true;
	} catch (e) { };


	if (apiCalledFlag)
		event.respondWith(
			fromNetwork(request).catch(() => fromCache(request))
		);
	else
		event.respondWith(
			fromCache(request).catch(() => fromNetwork(request))
		);
});
