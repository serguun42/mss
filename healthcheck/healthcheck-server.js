const http = require("http");
const fetch = require("node-fetch").default;
const { AbortError } = require("node-fetch");
const IS_DEV = require("./util/is-dev.js");

const CONFIG = IS_DEV ? require("../../DEV_CONFIGS/healthcheck.config.json") : require("./healthcheck.config.json");

const CHECKING_ORIGIN = process.env.CHECKING_ORIGIN || CONFIG.CHECKING_ORIGIN;
const API_VERSION = process.env.API_VERSION || CONFIG.API_VERSION;

const PONG_API_METHOD = new URL(`/api/v${API_VERSION}/stats`, CHECKING_ORIGIN);
const STATS_API_METHOD = new URL(`/api/v${API_VERSION}/stats`, CHECKING_ORIGIN);

class CustomError extends Error {
  constructor(message) {
    super(message);
  }
}

http
  .createServer((req, res) => {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end();
      return;
    }

    if (req.url !== "/" && req.url !== "") {
      res.statusCode = 404;
      res.end();
      return;
    }

    const pingSignaling = new AbortController();
    const pingSignalTimeout = setTimeout(() => pingSignaling.abort(), 5000);

    fetch(PONG_API_METHOD, { signal: pingSignaling.signal })
      .then((res) => {
        clearTimeout(pingSignalTimeout);

        if (!res.ok) return Promise.reject(new CustomError("Cannot ping service"));

        const statsSignaling = new AbortController();
        const statsSignalTimeout = setTimeout(() => pingSignaling.abort(), 5000);

        return fetch(STATS_API_METHOD, { signal: statsSignaling.signal }).then(
          /** @returns {Promise<{ groupsCount: number; scrapperUpdatedDate: string }>} */ (res) => {
            clearTimeout(statsSignalTimeout);

            if (!res.ok) return Promise.reject(new CustomError("Cannot get stats from service"));

            return res.json();
          }
        );
      })
      .then((stats) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=UTF-8");
        res.end(JSON.stringify({ ok: true, stats }));
      })
      .catch((reason) => {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=UTF-8");
        res.end(
          JSON.stringify({
            ok: false,
            reason:
              reason instanceof CustomError
                ? reason.message
                : reason instanceof AbortError
                ? "Connection timed out"
                : typeof reason === "string"
                ? reason
                : "Server is not OK"
          })
        );
      });
  })
  .listen(80);
