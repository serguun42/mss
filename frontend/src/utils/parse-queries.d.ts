export default GlobalParseQuery;
/**
 * @param {URL | String} [iLocation]
 * @returns {{[query: string]: string | true}}
 */
declare function GlobalParseQuery(iLocation?: URL | string): {
    [query: string]: string | true;
};
