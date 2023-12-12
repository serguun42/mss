import { createServer } from "http";
import routeLoggingPayload from "./interfaces/route.js";
import readPayload from "./util/read-payload.js";
import LogToConsole from "./interfaces/console.js";

const httpServer = createServer((req, res) => {
  /** @param {boolean} isOK */
  const sendResponse = (isOK) => {
    res.statusCode = isOK ? 200 : 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(isOK ? "200 OK" : "500 Internal Server Error");
  };

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("405 Method Not Allowed");
    return;
  }

  readPayload(req)
    .then((readBuffer) => {
      try {
        /** @type {import('./types').LoggingPayload} */
        const parsedJSON = JSON.parse(readBuffer.toString());
        return Promise.resolve(parsedJSON);
      } catch (e) {
        return Promise.reject(e);
      }
    })
    .then((loggingPayload) => {
      sendResponse(true);
      routeLoggingPayload(loggingPayload);
    })
    .catch((e) => {
      LogToConsole({
        error: true,
        args: ["Cannot read received log", e],
        tag: "notifier"
      });
    });
});

httpServer.listen(80);

process.on("unhandledRejection", (reason, promise) => {
  LogToConsole({
    error: true,
    args: ["Unhandled Rejection", promise, reason],
    tag: "notifier"
  });
});
