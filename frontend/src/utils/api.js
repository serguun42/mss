import CONFIG from "../config/config";


/**
 * @param {String} iMethod
 * @param {import("../typings").QueriesForApi} iQueries
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
 * @param {{method: String, queries: import("../typings").QueriesForApi}} iURL
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
 * @returns {Promise<import("../typings").TinyGroup[]>}
 */
export const GetAllGroups = () => FetchMethod({
	method: "groups/all"
});

/**
 * @param {String} groupName
 * @returns {Promise<import("../typings").RichGroup[]>}
 */
export const GetGroupsByName = (groupName) => FetchMethod({
	method: "groups/certain",
	queries: {
		name: groupName
	}
});

/**
 * @param {String} groupName
 * @param {String} groupSuffix
 * @returns {Promise<import("../typings").RichGroup[]>}
 */
export const GetGroupsByNameAndSuffix = (groupName, groupSuffix) => FetchMethod({
	method: "groups/certain",
	queries: {
		name: groupName,
		suffix: groupSuffix
	}
});

/**
 * @returns {Promise<Number>}
 */
export const GetCurrentWeek = () => fetch(API_URL_CONSTUCTOR("time/week"))
.then((res) => res.text())
.then((week) => Promise.resolve(parseInt(week)));
