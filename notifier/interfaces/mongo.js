import MongoDispatcher from "../database/dispatcher.js";
import readConfig from "../util/read-config.js";
import LogToConsole from "./console.js";

const { DATABASE_NAME } = readConfig();

const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);

/** @type {import('../types').LoggingInterface} */
export default function LogToMongo(loggingPayload) {
  mongoDispatcher
    .callDB()
    .then((db) => db.collection("logs").insertOne({ ...loggingPayload, date: new Date() }))
    .catch((e) => {
      LogToConsole({
        isError: true,
        args: ["Error with logging into MongoDB", e instanceof Error ? `${e.name}\n${e.message}` : `${e}`],
        tag: "notifier"
      });
    });
}
