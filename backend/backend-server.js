import { createServer, STATUS_CODES } from "node:http";
import promClient from "prom-client";
import { parsePath, parseQuery } from "./util/urls-and-cookies.js";
import coreAPIModule from "./api/core.js";
import logging from "./util/logging.js";

const register = new promClient.Registry();
register.setDefaultLabels({
  app: "backend-server"
});

promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in microseconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

register.registerMetric(httpRequestDurationMicroseconds);

export default function createBackendServer() {
  return createServer((req, res) => {
    const markMetrics = httpRequestDurationMicroseconds.startTimer();

    const path = parsePath(req.url);
    const queries = parseQuery(req.url);

    res.setHeader("Content-Type", "text/plain; charset=UTF-8");

    /**
     * @param {number} code
     * @param {string | Buffer | ReadStream | Object} data
     */
    const sendPayload = (code, data) => {
      res.statusCode = code;

      if (data instanceof Buffer || typeof data == "string") {
        const dataToSend = data.toString();

        res.end(dataToSend);
      } else {
        const dataToSend = JSON.stringify(data);
        res.setHeader("Content-Type", "application/json; charset=UTF-8");

        res.end(dataToSend);
      }

      markMetrics({
        method: req.method,
        route: `/${path.join("/")}`,
        code
      });
    };

    /** @param {number} code */
    const sendCode = (code) => {
      res.statusCode = code || 200;
      res.end(`${code || 500} ${STATUS_CODES[code || 500]}`);

      markMetrics({
        method: req.method,
        route: path,
        code
      });
    };

    if (path[0] === "metrics") {
      register
        .metrics()
        .then((metrics) => {
          res.setHeader("Content-Type", register.contentType);
          res.end(metrics);
        })
        .catch((e) => {
          logging(e);
          sendCode(500);
        });
      return;
    }

    if (path[0] !== "api") return sendCode(404);
    coreAPIModule({
      req,
      res,
      path,
      queries,
      sendCode,
      sendPayload
    });
  });
}

if (process.env.NODE_ENV !== "test") createBackendServer().listen(80);
