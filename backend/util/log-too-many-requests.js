import logging from "./logging.js";

const MINUTE = 60 * 1000;

/**
 * Connections from single IP
 * @type {{[ip: string]: number}}
 */
const RECENTLY_LOGGED_IPS = {};

/**
 * @param {import("http").IncomingMessage} req
 * @returns {void}
 */
export default function logTooManyRequests(req) {
  const cIP = req.headers?.["x-real-ip"] || req.socket?.remoteAddress;

  if (!cIP) return;

  if (!RECENTLY_LOGGED_IPS[cIP]) RECENTLY_LOGGED_IPS[cIP] = 1;
  else ++RECENTLY_LOGGED_IPS[cIP];

  setTimeout(() => --RECENTLY_LOGGED_IPS[cIP], MINUTE * 5);

  if (RECENTLY_LOGGED_IPS[cIP] > 1) return;

  logging(
    new Error(`Too many requests from ${typeof cIP === "string" ? cIP.replace("::ffff:", "") : cIP} to ${req.url}`)
  );
}
