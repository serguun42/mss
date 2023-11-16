const SECOND = 1e3,
  MINUTE = SECOND * 60,
  HOUR = MINUTE * 60,
  DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
  { MAX_NUMBER_OF_BACKEND_REQUESTS_IN_MINUTE, MAX_NUMBER_OF_BACKEND_REQUESTS_IN_HOUR, BACKEND_REQUESTS_WHITELIST } = DEV
    ? require("../../../DEV_CONFIGS/backend.config.json")
    : require("../backend.config.json");

/**
 * Connections from __*single IP*__ within __*last minute*__
 * @type {{[ip: string]: number}}
 * */
const MINUTE_IPS = new Object();

/**
 * Connections from __*single IP*__ within __*last hour*__
 * @type {{[ip: string]: number}}
 * */
const HOUR_IPS = new Object();

/**
 * Returns `TRUE` if connection should be limited (via _429 Too Many Requests_).
 * Returns `FALSE` if everything is okay.
 *
 * @param {import("http").IncomingMessage} req
 * @returns {boolean}
 */
module.exports = (req) => {
  const cIP = req.headers?.["x-real-ip"] || req.socket?.remoteAddress;

  if (!cIP) return true;

  if (BACKEND_REQUESTS_WHITELIST.includes(cIP)) return false;

  if (!MINUTE_IPS[cIP]) MINUTE_IPS[cIP] = 1;
  else ++MINUTE_IPS[cIP];

  if (!HOUR_IPS[cIP]) HOUR_IPS[cIP] = 1;
  else ++HOUR_IPS[cIP];

  if (process.env.NODE_ENV !== "test") {
    setTimeout(() => --MINUTE_IPS[cIP], MINUTE);
    setTimeout(() => --HOUR_IPS[cIP], HOUR);
  }

  if (MINUTE_IPS[cIP] > MAX_NUMBER_OF_BACKEND_REQUESTS_IN_MINUTE) return true;
  if (HOUR_IPS[cIP] > MAX_NUMBER_OF_BACKEND_REQUESTS_IN_HOUR) return true;

  return false;
};
