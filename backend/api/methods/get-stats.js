import logging from "../../util/logging.js";

/** @param {import("../../types").APIModuleDTO} moduleDTO */
export default function getStats({ mongoDispatcher, sendCode, sendPayload }) {
  if (!mongoDispatcher) return sendCode(500);

  mongoDispatcher
    .callDB()
    .then((DB) =>
      DB.collection("params")
        .findOne({ name: "scrapper_updated_date" })
        .then((scrapperUpdatedDate) => {
          if (scrapperUpdatedDate)
            return DB.collection("study_groups")
              .countDocuments()
              .then((groupsCount) => {
                sendPayload(200, {
                  scrapperUpdatedDate: new Date(scrapperUpdatedDate.value || 0).toISOString(),
                  groupsCount
                });
              });
          else sendPayload(404, "Property scrapper_updated_date not found");
        })
    )
    .catch((e) => {
      logging("Error listing groups", e);
      sendCode(500);
    });
}
