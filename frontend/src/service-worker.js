const CACHE_STORAGE_NAME = process.env.VUE_APP_CACHE_STORAGE_NAME;

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches
			.open(CACHE_STORAGE_NAME)
			.then((cache) =>
				cache.addAll([
					"/",
					"/favicon.ico",
					...(process.env.ROUTES || []).filter((path) => path.length > 1)
				])
			)
	);
});

self.addEventListener("activate", () => {});

self.addEventListener("beforeinstallprompt", () => {});

/**
 * Fetch network and put into cache
 *
 * @param {Request} request
 * @return {Promise<Response>}
 */
const fromNetwork = (request) =>
	fetch(request).then((response) => {
		if (response.ok)
			caches
				.open(CACHE_STORAGE_NAME)
				.then((cache) => cache.put(request, response.clone()))
				.catch(console.warn);

		return response.clone();
	});

/**
 * Get from cache
 *
 * @param {Request} request
 * @return {Promise<Response>}
 */
const fromCache = (request) =>
	caches
		.open(CACHE_STORAGE_NAME)
		.then((cache) => cache.match(request))
		.then((matching) => {
			if (matching) return Promise.resolve(matching);

			return Promise.reject("no-match");
		});

self.addEventListener(
	"fetch",
	/** @param {Event & { request: Request }} event */ (event) => {
		const { request } = event;

		if (request.method !== "GET")
			return fetch(request).catch((e) => {
				console.warn(e);
				return new Response("");
			});

		let apiCalledFlag = false;

		try {
			const parsedURL = new URL(request.url || "", process.env.VUE_APP_FULL_PATH);
			apiCalledFlag = /^\/api\//i.test(parsedURL.pathname);
		} catch (e) {}

		if (apiCalledFlag)
			return event.respondWith(
				fromNetwork(request)
					.catch(() => fromCache(request))
					.catch((e) => {
						console.warn(e);
						return new Response("");
					})
			);

		event.respondWith(
			fromCache(request)
				.catch(() => fromNetwork(request))
				.catch((e) => {
					console.warn(e);
					return new Response("");
				})
		);
	}
);
