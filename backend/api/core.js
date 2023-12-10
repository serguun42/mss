import rateLimiter from "../util/rate-limiter.js";
import logging from "../util/logging.js";
import logTooManyRequests from "../util/log-too-many-requests.js";
import MongoDispatcher from "../database/dispatcher.js";
import readConfig from "../util/read-config.js";
import listAllGroups from "./methods/list-groups-all.js";
import getCertainGroup from "./methods/get-group.js";
import getStartTime from "./methods/get-start-time.js";
import getCurrentWeek from "./methods/get-week.js";
import getStats from "./methods/get-stats.js";

const SECOND = 1e3;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const { DATABASE_NAME } = readConfig();

/** @param {import("../types").APIModuleDTO} moduleDTO */
export default function coreAPIModule(moduleDTO) {
  const { res, req, path, sendCode, sendPayload } = moduleDTO;

  moduleDTO.mongoDispatcher = new MongoDispatcher(DATABASE_NAME);

  if (rateLimiter(req)) {
    logTooManyRequests(req);
    return sendCode(429);
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (path[0] !== "api" && path[1] !== "v1.3") return sendPayload(400, { error: true, message: "No such API version" });

  switch (path[2]) {
    case "groups":
      switch (path[3]) {
        case "all":
          listAllGroups(moduleDTO);
          break;

        case "certain":
          getCertainGroup(moduleDTO);
          break;

        default:
          sendPayload(404, { error: true, message: "No such method" });
          break;
      }
      break;

    case "time":
      switch (path[3]) {
        case "startTime":
          getStartTime(moduleDTO);
          break;

        case "week":
          getCurrentWeek();
          break;

        default:
          sendPayload(404, { error: true, message: "No such method" });
          break;
      }
      break;

    case "stats":
      getStats(moduleDTO);
      break;

    case "ping":
      sendPayload(200, {
        message: "pong"
      });
      break;

    case "logs":
      switch (path[3]) {
        case "post":
          sendCode(201);
          break;

        default:
          sendPayload(404, { error: true, message: "No such method" });
          break;
      }
      break;

    default:
      sendPayload(404, { error: true, message: "No such method" });
      break;
  }
}
