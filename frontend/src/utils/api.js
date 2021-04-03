import CONFIG from "../config/config";


/**
 * @param {String} iMethod
 * @param {import("./types").QueriesForApiType} iQueries
 * @returns {String}
 */
const API_URL_CONSTUCTOR = (iMethod, iQueries) => {
	const baseAndMethod = `${CONFIG.API.BASE_URL}/${CONFIG.API.VERSION}/${iMethod}`;
	const queriesCombined = (
		iQueries && Object.keys(iQueries).length
		?
			"?" +
			Object.keys(iQueries)
			.map((key) => {
				const queryParamValue = iQueries[key];

				if (queryParamValue === true)
					return key;

				if (
					typeof queryParamValue == "object" &&
					queryParamValue.notEncode === true &&
					queryParamValue.value
				)
					return `${key}=${queryParamValue.value}`;

				return`${key}=${encodeURIComponent(queryParamValue)}`;
			})
			.join("&")
		:
			""
	);

	return `${baseAndMethod}${queriesCombined}`;
};

/**
 * @param {{method: String, queries: import("./types").QueriesForApiType}} iURL
 * @param {RequestInit} iOptions
 */
const FetchMethod = (iURL, iOptions) => {
	const actualURL = API_URL_CONSTUCTOR((iURL.method || iURL), iURL.queries || {}),
		  actualOptions = iOptions || {};

	return fetch(actualURL, actualOptions)
	.then((res) => {
		if (res.status === 200)
			return res.json();
		else
			return Promise.reject(`Status code ${res.status} ${res.statusText}`);
	});
};

/**
 * @returns {Promise<import("./types").TinyGroupType[]>}
 */
export const GetAllGroups = () => FetchMethod({
	method: "groups",
	queries: {
		getAll: true
	}
});

/**
 * @param {String} groupName
 * @returns {Promise<import("./types").RichGroupType[]>}
 */
export const GetGroupsByName = (groupName) => FetchMethod({
	method: "groups",
	queries: {
		get: groupName
	}
});

/**
 * @param {String} groupName
 * @param {String} groupSuffix
 * @returns {Promise<import("./types").RichGroupType[]>}
 */
export const GetGroupsByNameAndSuffix = (groupName, groupSuffix) => FetchMethod({
	method: "groups",
	queries: {
		get: groupName,
		suffix: groupSuffix
	}
});
