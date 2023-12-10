import logging from "../../util/logging.js";

/** @param {import("../../types").APIModuleDTO} moduleDTO */
export default function getCertainGroup({ mongoDispatcher, sendCode, sendPayload, queries }) {
  if (!mongoDispatcher) return sendCode(500);

  if (typeof queries["name"] !== "string")
    return sendPayload(400, { error: true, message: "No required <name> parameter" });

  const selector = {
    groupName: queries["name"]
  };

  if (queries["suffix"] && typeof queries["suffix"] === "string") selector["groupSuffix"] = queries["suffix"];

  mongoDispatcher
    .callDB()
    .then((DB) =>
      DB.collection("study_groups").find(selector).sort({ groupName: 1, groupSuffix: 1 }).project({ _id: 0 }).toArray()
    )
    .then((groups) => {
      if (!groups.length) sendPayload(404, []);
      else sendPayload(200, groups);
    })
    .catch((e) => {
      logging("Error getting certain group", e);
      sendCode(500);
    });
}
