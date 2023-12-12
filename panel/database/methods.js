import readConfig from "../util/read-config.js";
import MongoDispatcher from "./dispatcher.js";

const mongoDispatcher = new MongoDispatcher(readConfig().DATABASE_NAME);

const DB_METHODS = {
  listAllParams() {
    return mongoDispatcher
      .callDB()
      .then((db) => db.collection("params").find({}).project({ name: true, value: true, _id: false }).toArray());
  },

  /**
   * @param {{ name: string, value: any }} [payload]
   */
  setParam(payload) {
    if (typeof payload !== "object") return Promise.reject(new Error("Malformed payload"));
    if (!("name" in payload)) return Promise.reject(new Error("Missing name"));
    if (!("value" in payload)) return Promise.reject(new Error("Missing value"));
    if (typeof payload.name !== "string") return Promise.reject(new Error("Malformed name"));

    const trueParamValue =
      payload.name === "start_of_weeks"
        ? parseInt(payload.value)
        : payload.name === "scrapper_updated_date"
        ? new Date(payload.value)
        : payload.name === "scrapper_interval_seconds"
        ? parseInt(payload.value)
        : payload.value;

    return mongoDispatcher
      .callDB()
      .then((db) =>
        db.collection("params").updateOne({ name: payload.name }, { $set: { value: trueParamValue } }, { upsert: true })
      )
      .then((updateResult) => Promise.resolve(updateResult.modifiedCount));
  },

  /**
   * @param {number} [skip]
   * @param {number} [limit]
   */
  getLogs(skip, limit) {
    if (!skip) skip = 0;
    if (!limit) limit = 50;

    limit = Math.min(limit, 100);

    return mongoDispatcher.callDB().then((db) =>
      db
        .collection("logs")
        .find({})
        .sort({ date: -1 })
        .skip(skip || 0)
        .limit(limit || 0)
        .project({ _id: false })
        .toArray()
    );
  }
};

export default DB_METHODS;
