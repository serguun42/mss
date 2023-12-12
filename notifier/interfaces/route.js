import LogToConsole from "./console.js";
import LogToMongo from "./mongo.js";
import LogToTelegram from "./telegram.js";

/** @type {import('../types').LoggingInterface} */
export default function routeLoggingPayload(loggingPayload) {
  if (typeof loggingPayload !== "object" || !Array.isArray(loggingPayload?.args) || !loggingPayload?.tag)
    loggingPayload = {
      isError: true,
      args: [
        "Passed payload is not of correct type",
        typeof loggingPayload === "object" ? JSON.stringify(loggingPayload, null, 2) : `${loggingPayload}`
      ],
      tag: "notifier"
    };

  if (!loggingPayload?.tag) loggingPayload.tag = "unknown";

  LogToConsole(loggingPayload);
  if (loggingPayload.isError || loggingPayload.tag === "ci") LogToTelegram(loggingPayload);
  LogToMongo(loggingPayload);
}
