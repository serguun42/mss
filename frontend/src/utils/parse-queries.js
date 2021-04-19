/**
 * @param {URL | String} [iLocation]
 * @returns {{[query: string]: string | true}}
 */
const GlobalParseQuery = (iLocation) => {
	if (!iLocation) iLocation = location.search;
	if (iLocation instanceof URL) iLocation = iLocation.search;

	const query = iLocation ? iLocation.slice(1) : "";
	if (!query) return {};

	const list = {},
		  queries = query.split("&");

	queries.forEach((queryPair) => {
		const [key, value] = queryPair.split("=");

		try {
			list[decodeURIComponent(key)] = value ? decodeURIComponent(value) : true
		} catch (e) {
			list[key] = value || true
		};
	});

	return list;
};

export default GlobalParseQuery;