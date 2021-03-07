const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{ DATABASE_NAME } = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("./backend.config.json"),
	MongoDispatcher = require("../utils/database"),
	Logging = require("../utils/logging");


const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);


/**
 * @param {import("../utils/urls-and-cookies").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { queries, path, GlobalSendCustom } = iModuleDataObject;

	if (path[0] !== "api") return GlobalSendCustom(400, {error: true, message: "No such version"});

	if (path[1] === "v1") {
		switch (path[2]) {
			case "groups":
				if (queries["getAll"])
					mongoDispatcher.callDB()
					.then((DB) => DB.collection("study-groups").find({}).project({groupName: 1, groupSuffix: 1, _id: 0}).toArray())
					.then((names) => GlobalSendCustom(200, names))
					.catch(Logging);
				else if (queries["get"]) {
					const selector = {
						groupName: queries["get"]
					};

					if (queries["suffix"] && typeof queries["suffix"] === "string")
						selector["groupSuffix"] = queries["suffix"];
					
					mongoDispatcher.callDB()
					.then((DB) => DB.collection("study-groups").find(selector).project({_id: 0}).toArray())
					.then((groups) => {
						if (!groups.length)
							GlobalSendCustom(400, {error: true, message: "Not found"});
						else if (groups.length === 1)
							GlobalSendCustom(200, groups[0]);
						else
							GlobalSendCustom(200, groups);
					})
					.catch(Logging);
				} else
					GlobalSendCustom(400, {error: true, message: "No such method"});
			break;

			default: GlobalSendCustom(400, {error: true, message: "No such method"}); break;
		}
	} else
		return GlobalSendCustom(400, {error: true, message: "No such version"});
};
