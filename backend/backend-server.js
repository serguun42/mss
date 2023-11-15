const http = require("http");

/**
 * @param {{[code: string]: string}} iStatusCodes
 * @returns {{[code: number]: string}}
 */
const GetStatusCodes = (iStatusCodes) => {
  const newCodes = {};

  Object.keys(iStatusCodes).forEach((code) => (newCodes[code] = `${code} ${iStatusCodes[code]}`));

  return newCodes;
};

/**
 * HTTP Response Statuses
 * @type {{[code: number]: string}}
 */
const STATUSES = GetStatusCodes(http.STATUS_CODES);

const UTIL = require("./utils/urls-and-cookies");

http
  .createServer((req, res) => {
    const pathname = UTIL.SafeDecode(UTIL.SafeURL(req.url).pathname),
      path = UTIL.ParsePath(pathname),
      queries = UTIL.ParseQuery(UTIL.SafeURL(req.url).search),
      cookies = UTIL.ParseCookie(req.headers);

    res.setHeader("Content-Type", "charset=UTF-8");

    /**
     * @param {number} iCode
     * @param {string | Buffer | ReadStream | Object} iData
     * @returns {false}
     */
    const GlobalSendCustom = (iCode, iData) => {
      res.statusCode = iCode;

      if (iData instanceof Buffer || typeof iData == "string") {
        const dataToSend = iData.toString();

        res.end(dataToSend);
      } else {
        const dataToSend = JSON.stringify(iData);
        res.setHeader("Content-Type", UTIL.SetCompleteMIMEType(".json"));

        res.end(dataToSend);
      }

      return false;
    };

    /**
     * @param {number} iCode
     * @returns {false}
     */
    const GlobalSend = (iCode) => {
      res.statusCode = iCode || 200;
      res.end(STATUSES[iCode || 500]);
      return false;
    };

    /** @type {import("./types").ModuleCallingObjectType} */
    const CALLING_PROPS = {
      req,
      res,
      pathname,
      path,
      queries,
      cookies,
      GlobalSend,
      GlobalSendCustom
    };

    if (path[0] === "api") return require("./pages/api")(CALLING_PROPS);
    else return GlobalSend(404);
  })
  .listen(80);
