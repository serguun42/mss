import logging from "../../util/logging.js";

/** @param {import("../../types").APIModuleDTO} moduleDTO */
export default function getStartTime({ mongoDispatcher, sendCode, sendPayload }) {
  if (!mongoDispatcher) return sendCode(500);

  mongoDispatcher
    .callDB()
    .then((DB) => DB.collection("params").findOne({ name: "start_of_weeks" }))
    .then((found) => {
      if (found && found.value) sendPayload(200, new Date(found.value).toISOString());
      else sendPayload(404, "Property start_of_weeks not found");
    })
    .catch((e) => {
      logging("Error listing groups", e);
      sendCode(500);
    });
}
