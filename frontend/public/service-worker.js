const CACHE_STORAGE_NAME = "cache_static_and_dynamic_with_api";

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches
		.open(CACHE_STORAGE_NAME)
		.then(cache => cache.addAll([
			"/",
			"/all",
			"/group",
			"/apps",
			"/about",
			"/privacy",
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

	const putToCacheChecker = [
		/^(\/?)$/,
		/^\/all(\/?)$/,
		/^\/group(\/?)$/,
		/^\/apps(\/?)$/,
		/^\/about(\/?)$/,
		/^\/docs\/api(\/?)$/,
		/^\/api\//i,
		/^\/manifest.json/gi,
		/^\/manifest.webmanifest/gi,
		/\.(woff2|woff|ttf|js|css)$/gi,
		/^\/img\/icons\/(round|maskable)\/(round|maskable)_(\d+x\d+)\.png$/gi
	].some((regexp) => regexp.test(requestedURL.pathname));

	if (putToCacheChecker)
		return fetch(request)
				.then((response) => {
					if (response.status === 200)
						caches.open(CACHE_STORAGE_NAME)
						.then((cache) => cache.put(request, response.clone()))
						.catch(console.warn);

					return response.clone();
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

	if (request.method !== "GET")
		return fetch(request)
		.catch((e) => {
			console.warn(e);
			return new Response("");
		});


	let apiCalledFlag = false;

	try {
		const parsedURL = new URL(request.url || "", "https://mirea.xyz");

		if (/^\/api\//i.test(parsedURL.pathname))
			apiCalledFlag = true;
	} catch (e) { };


	if (apiCalledFlag)
		event.respondWith(
			fromNetwork(request)
			.catch(() => fromCache(request))
			.catch((e) => {
				console.warn(e);
				return new Response("");
			})
		);
	else
		event.respondWith(
			fromCache(request)
			.catch(() => fromNetwork(request))
			.catch((e) => {
				console.warn(e);
				return new Response("");
			})
		);
});
