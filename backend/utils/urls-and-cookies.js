/**
 * MIME-Type accordance for different file formats
 * @type {{format: string, type: string, noCharset?: boolean}[]}
 */
const TYPES_ACCORDANCE = [
  { format: "mp4", type: "video/mp4", noCharset: true },
  { format: "mpeg", type: "video/mpeg", noCharset: true },
  { format: "mkv", type: "video/x-matroska", noCharset: true },
  { format: "avi", type: "video/x-msvideo", noCharset: true },
  { format: "mp3", type: "audio/mp3", noCharset: true },
  { format: "aac", type: "audio/aac", noCharset: true },
  { format: "ac3", type: "audio/ac3", noCharset: true },
  { format: "wav", type: "audio/wav", noCharset: true },
  { format: "flac", type: "audio/flac", noCharset: true },
  { format: "ape", type: "audio/x-monkeys-audio", noCharset: true },
  { format: "txt", type: "text/plain" },
  { format: "html", type: "text/html" },
  { format: "js", type: "application/javascript" },
  { format: "vue", type: "application/javascript" },
  { format: "json", type: "application/json" },
  { format: "webmanifest", type: "application/json" },
  { format: "yaml", type: "text/yaml" },
  { format: "css", type: "text/css" },
  { format: "xml", type: "text/xml" },
  { format: "jpeg", type: "image/jpeg", noCharset: true },
  { format: "jfif", type: "image/jpeg", noCharset: true },
  { format: "jpg", type: "image/jpeg", noCharset: true },
  { format: "png", type: "image/png", noCharset: true },
  { format: "gif", type: "image/gif", noCharset: true },
  { format: "psd", type: "image/psd", noCharset: true },
  { format: "ico", type: "image/x-icon", noCharset: true },
  { format: "webp", type: "image/webp", noCharset: true },
  { format: "svg", type: "image/svg+xml" },
  { format: "woff2", type: "font/woff2", noCharset: true },
  { format: "woff", type: "font/woff", noCharset: true },
  { format: "ttf", type: "font/ttf", noCharset: true },
  { format: "srt", type: "text/plain" },
  { format: "vtt", type: "text/vtt" },
  { format: "zip", type: "application/zip", noCharset: true },
  { format: "pdf", type: "application/pdf" }
];

/**
 * @param {string} iString
 * @returns {string}
 */
const SafeDecode = (iString) => {
  if (typeof iString !== "string") return iString;

  try {
    const decoded = decodeURIComponent(iString);
    return SafeEscape(decoded);
  } catch (e) {
    return SafeEscape(iString);
  }
};

/**
 * @param {string} iString
 * @returns {string}
 */
const SafeEscape = (iString) => {
  if (typeof iString !== "string") return iString;

  return iString
    .replace(/(\/+)/gi, "/")
    .replace(/\.\.\%2F/gi, "")
    .replace(/\.\.\//g, "");
};

/**
 * @param {string} reqHeaders
 * @returns {{[name: string]: string}}
 */
const ParseCookie = (reqHeaders) => {
  if (!reqHeaders.cookie) return {};

  const returningList = {},
    cookies = reqHeaders.cookie;

  cookies.split(";").forEach((cookie) => {
    const parts = cookie.split("="),
      cookieName = parts.shift().trim(),
      cookieValue = parts.join("=");

    try {
      returningList[cookieName] = decodeURIComponent(cookieValue);
    } catch (e) {
      returningList[cookieName] = cookieValue;
    }
  });

  return returningList;
};

/**
 * @param {string} pathname
 * @returns {string[]}
 */
const ParsePath = (pathname) => {
  const safePathname = SafeURL(SafeDecode(pathname)).pathname;

  return safePathname.replace().split("/").filter(Boolean);
};

/**
 * @param {string} query
 * @returns {{[queryName: string]: string | true}}
 */
const ParseQuery = (query) => {
  if (!query) return {};

  const returningList = {};

  query
    .toString()
    .replace(/^\?/, "")
    .split("&")
    .forEach((queryPair) => {
      try {
        if (queryPair.split("=")[1])
          returningList[queryPair.split("=")[0]] = decodeURIComponent(queryPair.split("=")[1]);
        else returningList[queryPair.split("=")[0]] = true;
      } catch (e) {
        returningList[queryPair.split("=")[0]] = queryPair.split("=")[1] || true;
      }
    });

  return returningList;
};

/**
 * @param {{[queryName: string]: string | true}} queries
 * @returns {string}
 */
const CombineQueries = (queries) => {
  if (typeof queries !== "object") return "";
  if (!Object.keys(queries).length) return "";

  return (
    "?" +
    Object.keys(queries)
      .map((key) => (queries[key] === true ? key : `${key}=${encodeURIComponent(queries[key])}`))
      .join("&")
  );
};

/**
 * @param {string} pathname
 * @returns {URL}
 */
const SafeURL = (pathname) => {
  if (typeof pathname !== "string") return new URL("/", `https://mirea.xyz`);

  return new URL(pathname.replace(/\/+/g, "/"), `https://mirea.xyz`);
};

/**
 * @param {string} location
 * @returns {string}
 */
const SetMIMEType = (location) => {
  const filename = location.toString().split("/").pop(),
    index = TYPES_ACCORDANCE.findIndex((type) => type.format === filename.split(".").pop());

  if (!filename.match(/\./)) return "text/plain";
  else if (index > -1) return TYPES_ACCORDANCE[index].type;
  else return filename.split(".").pop();
};

/**
 * @param {string} location
 * @returns {string}
 */
const SetCompleteMIMEType = (location) => {
  const filename = location.toString().split("/").pop(),
    index = TYPES_ACCORDANCE.findIndex((type) => type.format === filename.split(".").pop());

  if (!filename.match(/\./)) return "text/plain";
  else if (index > -1) {
    if (TYPES_ACCORDANCE[index].noCharset) return TYPES_ACCORDANCE[index].type;
    else return TYPES_ACCORDANCE[index].type + "; charset=UTF-8";
  } else return filename.split(".").pop();
};

/** @type {import("../types").UtilsType} */
module.exports = {
  SafeDecode,
  SafeEscape,
  SafeURL,
  ParseCookie,
  ParsePath,
  ParseQuery,
  CombineQueries,
  SetMIMEType,
  SetCompleteMIMEType
};
