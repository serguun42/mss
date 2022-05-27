import API_CONFIG from "../config/api-config";


/**
 * @param {string} iMethod
 * @param {import("../types").QueriesForApi} iQueries
 * @returns {string}
 */
const API_URL_CONSTUCTOR = (iMethod, iQueries) => {
	const baseAndMethod = `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}/${iMethod}`;
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
 * @param {{method: String, queries: import("../types").QueriesForApi}} iURL
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
export const GetCurrentWeek = () => fetch(API_URL_CONSTUCTOR("time/week"))
.then((res) => res.text())
.then((week) => Promise.resolve(parseInt(week)));

/**
 * @returns {Promise<Date>}
 */
export const GetTimeStart = () => fetch(API_URL_CONSTUCTOR("time/startTime"))
.then((res) => res.text())
.then((timeStart) => Promise.resolve(new Date(timeStart)));
