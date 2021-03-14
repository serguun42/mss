const
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
 * @param {import("../utils/urls-and-cookies").ModuleCallingObjectType} iModuleDataObject
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
				if (queries["getAll"])
					mongoDispatcher.callDB()
					.then((DB) => DB.collection("study-groups").find({}).project({ groupName: 1, groupSuffix: 1, _id: 0 }).toArray())
					.then((names) => GlobalSendCustom(200, names))
					.catch(Logging);
				else if (queries["get"]) {
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

			default: GlobalSendCustom(400, {error: true, message: "No such method"}); break;
		}
	} else
		return GlobalSendCustom(400, {error: true, message: "No such API version"});
};
