import API_CONFIG from "../config/api-config.json";


/**
 * @param {string} method
 * @param {import("../types").QueriesForApi} [queries]
 * @returns {string}
 */
const apiUrlConstructor = (method, queries = {}) => {
	const builtURL = new URL(`${API_CONFIG.VERSION}/${method}`, API_CONFIG.BASE_URL);
	if (!queries) queries = {};

    Object.keys(queries).forEach((queryName) => {
      if (queries[queryName]) builtURL.searchParams.set(queryName, queries[queryName]);
    });

	return builtURL.href;
};

/**
 * @type {{ [requestURL: string]: Response }}
 */
const fetchCache = {};

/**
 * @param {{ method: string, queries: import("../types").QueriesForApi, asText?: boolean, options?: RequestInit }} props
 */
const FetchMethod = ({ method, queries, asText, options }) => {
	const actualURL = apiUrlConstructor(method, queries || {});
	const actualOptions = options || {};
	const cached = fetchCache[actualURL];

	return (cached ? Promise.resolve(cached) : fetch(actualURL, actualOptions))
	.then((res) => {
		if (!res.ok)
			return Promise.reject(new Error(`${actualURL}: Status code ${res.status} ${res.statusText}`));

		fetchCache[actualURL] = res.clone();

		if (asText) return res.text();

		return res.json();
	});
};

/**
 * @returns {Promise<import("../types").TinyGroup[]>}
 */
export const GetAllGroups = () => FetchMethod({
	method: "groups/all"
});

/**
 * @param {string} groupName
 * @returns {Promise<import("../types").RichGroup[]>}
 */
export const GetGroupsByName = (groupName) => FetchMethod({
	method: "groups/certain",
	queries: {
		name: groupName
	}
});

/**
 * @param {string} groupName
 * @param {string} groupSuffix
 * @returns {Promise<import("../types").RichGroup[]>}
 */
export const GetGroupsByNameAndSuffix = (groupName, groupSuffix) => FetchMethod({
	method: "groups/certain",
	queries: {
		name: groupName,
		suffix: groupSuffix
	}
});

/**
 * @returns {Promise<import("../types").Stats>}
 */
export const Stats = () => FetchMethod({
	method: "stats"
});

/**
 * @returns {Promise<number>}
 */
export const GetCurrentWeek = () => FetchMethod({
	method: "time/week",
	asText: true
}).then((week) => Promise.resolve(parseInt(week)));

/**
 * @returns {Promise<Date>}
 */
export const GetTimeStart = () => FetchMethod({
	method: "time/startTime",
	asText: true
}).then((timeStart) => Promise.resolve(new Date(timeStart)));
