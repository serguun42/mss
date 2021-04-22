const
	SECOND = 1e3,
	MINUTE = SECOND * 60,
	HOUR = MINUTE * 60,
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		DATABASE_NAME,
		HOSTNAME
	} = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json"),
	RateLimiter = require("../utils/rate-limiter"),
	MongoDispatcher = require("../utils/database"),
	Logging = require("../utils/logging");


const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);


/**
 * @param {import("../typings").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { req, queries, path, GlobalSend, GlobalSendCustom } = iModuleDataObject;


	if (RateLimiter(req)) {
		Logging(`Too many requests from ${req?.socket?.remoteAddress} on ${HOSTNAME}${req.url}`);
		return GlobalSend(429);
	};


	if (path[0] !== "api") return GlobalSendCustom(400, {error: true, message: "No such version"});

	if (path[1] === "v1") {
		switch (path[2]) {
			case "groups":
				if (queries["getAll"]) {
					mongoDispatcher.callDB()
					.then((DB) => DB.collection("study-groups").find({}).project({ groupName: 1, groupSuffix: 1, _id: 0 }).toArray())
					.then((names) => GlobalSendCustom(200, names))
					.catch(Logging);
				} else if (queries["get"]) {
					const selector = {
						groupName: queries["get"]
					};

					if (queries["suffix"] && typeof queries["suffix"] === "string")
						selector["groupSuffix"] = queries["suffix"];

					mongoDispatcher.callDB()
					.then((DB) => DB.collection("study-groups").find(selector).project({ _id: 0 }).toArray())
					.then((groups) => {
						if (!groups.length)
							GlobalSendCustom(404, []);
						else
							GlobalSendCustom(200, groups);
					})
					.catch(Logging);
				} else
					GlobalSendCustom(400, {error: true, message: "No such action"});
			break;

			case "time":
				switch (path[3]) {
					case "startTime":
						mongoDispatcher.callDB()
						.then((DB) => DB.collection("params").findOne({ name: "start_of_weeks" }))
						.then((found) => {
							if (found && found.value)
								GlobalSendCustom(200, `${found.value}`);
							else
								GlobalSendCustom(404, "Property start_of_weeks not found");
						})
						.catch(Logging);
					break;

					case "week":
						mongoDispatcher.callDB()
						.then((DB) => DB.collection("params").findOne({ name: "start_of_weeks" }))
						.then((found) => {
							if (found && found.value)
								GlobalSendCustom(200, Math.ceil((Date.now() - found.value) / (7 * 24 * HOUR)));
							else
								GlobalSendCustom(404, "Cannot compute current week");
						})
						.catch(Logging);
					break;

					case "currentDay":
						GlobalSendCustom(200, new Date(Date.now() + (!DEV) * 3 * HOUR).getDay());
					break;

					default: GlobalSendCustom(400, {error: true, message: "No such method"}); break;
				}
			break;

			default: GlobalSendCustom(400, {error: true, message: "No such method"}); break;
		}
	} else
		return GlobalSendCustom(400, {error: true, message: "No such API version"});
};
