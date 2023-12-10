import logging from "../../util/logging.js";

/** @param {import("../../types").APIModuleDTO} moduleDTO */
export default function listAllGroups({ mongoDispatcher, sendCode, sendPayload }) {
  if (!mongoDispatcher) return sendCode(500);

  mongoDispatcher
    .callDB()
    .then((DB) =>
      DB.collection("study_groups")
        .find()
        .sort({ groupName: 1, groupSuffix: 1 })
        .project({ groupName: 1, groupSuffix: 1, _id: 0 })
        .toArray()
    )
    .then((names) => sendPayload(200, names))
    .catch((e) => {
      logging("Error listing groups", e);
      sendCode(500);
    });
}
