import logging from "../../util/logging.js";

/** @param {import("../../types").APIModuleDTO} moduleDTO */
export default function getCurrentWeek({ mongoDispatcher, sendCode, sendPayload }) {
  if (!mongoDispatcher) return sendCode(500);

  mongoDispatcher
    .callDB()
    .then((DB) => DB.collection("params").findOne({ name: "start_of_weeks" }))
    .then((found) => {
      if (found && found.value) sendPayload(200, Math.ceil((Date.now() - found.value) / (7 * 24 * HOUR)));
      else sendPayload(404, "Cannot compute current week");
    })
    .catch((e) => {
      logging("Error listing groups", e);
      sendCode(500);
    });
}
