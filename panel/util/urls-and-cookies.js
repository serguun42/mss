/**
 * @param {string} encoded
 * @returns {string}
 */
const safeDecode = (encoded) => {
  if (typeof encoded !== "string") return encoded;

  try {
    const decoded = decodeURIComponent(encoded);
    return decoded
      .replace(/(\/+)/gi, "/")
      .replace(/\.\.\%2F/gi, "")
      .replace(/\.\.\//g, "");
  } catch (e) {
    return encoded
      .replace(/(\/+)/gi, "/")
      .replace(/\.\.\%2F/gi, "")
      .replace(/\.\.\//g, "");
  }
};

/**
 * @param {string} pathname
 * @param {string} [origin]
 * @returns {URL}
 */
const buildSafeURL = (pathname, origin) => {
  if (typeof origin !== "string") origin = "https://example.com";

  if (typeof pathname !== "string") return new URL("/", origin);

  try {
    return new URL(safeDecode(pathname), origin);
  } catch (e) {
    return new URL("/", origin);
  }
};

/**
 * @param {string} requestedURL
 * @returns {string[]}
 */
export const parsePath = (requestedURL) => {
  const safePathname = buildSafeURL(requestedURL, "https://mirea.xyz").pathname;

  return safePathname.split("/").filter(Boolean);
};

/**
 * @param {string} requestedURL
 * @returns {{[queryName: string]: string}}
 */
export const parseQuery = (requestedURL) => {
  if (!requestedURL) return {};

  /** @type {{[queryName: string]: string}} */
  const queries = {};
  const safeSearchParams = buildSafeURL(requestedURL, "https://mirea.xyz").searchParams;

  Array.from(safeSearchParams.entries()).forEach(([queryName, queryValue]) => {
    queries[queryName] = queryValue || true;
  });

  return queries;
};

/**
 * @param {Record<string, string>} reqHeaders
 * @returns {{ [cookieName: string]: string }}
 */
export const parseCookies = (reqHeaders) => {
  const cookies = {};

  if (reqHeaders.cookie)
    reqHeaders.cookie.split(";").forEach((cookie) => {
      const [cookieName, cookieValue] = cookie.split("=");

      try {
        cookies[cookieName.trim()] = decodeURIComponent(cookieValue.trim());
      } catch (e) {
        cookies[cookieName.trim()] = cookieValue.trim();
      }
    });

  return cookies;
};
