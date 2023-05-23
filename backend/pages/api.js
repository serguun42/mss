const
	SECOND = 1e3,
	MINUTE = SECOND * 60,
	HOUR = MINUTE * 60,
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{ DATABASE_NAME } = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json"),
	RateLimiter = require("../utils/rate-limiter"),
	MongoDispatcher = require("../utils/database"),
	Logging = require("../utils/logging");

/**
 * Connections from __*single IP*__
 * @type {{[ip: string]: number}}
 * */
const RECENTLY_LOGGED_IPS = {};

/**
 * @param {import("http").IncomingMessage} req
 * @returns {void}
 */
const LogTooManyRequests = (req) => {
	const cIP = req.headers?.["x-real-ip"] || req.socket?.remoteAddress;

	if (!cIP) return;

	if (!RECENTLY_LOGGED_IPS[cIP])
		RECENTLY_LOGGED_IPS[cIP] = 1;
	else
		++RECENTLY_LOGGED_IPS[cIP];

	setTimeout(() => --RECENTLY_LOGGED_IPS[cIP], MINUTE * 5);

	if (RECENTLY_LOGGED_IPS[cIP] > 1) return;

	Logging(`Too many requests from ${typeof cIP === "string" ? cIP.replace("::ffff:", "") : cIP} to ${req.url}`);
};


const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);


/**
 * @param {import("../types").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { res, req, queries, path, GlobalSend, GlobalSendCustom } = iModuleDataObject;

	if (RateLimiter(req)) {
		LogTooManyRequests(req);
		return GlobalSend(429);
	};


	res.setHeader("Access-Control-Allow-Origin", "*");

	if (path[0] !== "api") return GlobalSendCustom(400, {error: true, message: "No such version"});

	if (path[1] === "v1") {
		switch (path[2]) {
			case "groups":
				if (queries["getAll"]) {
					mongoDispatcher.callDB()
					.then((DB) =>
						DB.collection("study_groups")
						.find()
						.sort({ groupName: 1, groupSuffix: 1 })
						.project({ groupName: 1, groupSuffix: 1, _id: 0 })
						.toArray()
					)
					.then((names) => GlobalSendCustom(200, names))
					.catch(Logging);
				} else if (queries["get"]) {
					const selector = {
						groupName: queries["get"]
					};

					if (queries["suffix"] && typeof queries["suffix"] === "string")
						selector["groupSuffix"] = queries["suffix"];

					mongoDispatcher.callDB()
					.then((DB) =>
						DB.collection("study_groups")
						.find(selector)
						.sort({ groupName: 1, groupSuffix: 1 })
						.project({ _id: 0 })
						.toArray()
					)
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
	} else if (path[1] === "v1.1") {
		switch (path[2]) {
			case "groups":
				switch (path[3]) {
					case "all":
						mongoDispatcher.callDB()
						.then((DB) =>
							DB.collection("study_groups")
							.find()
							.sort({ groupName: 1, groupSuffix: 1 })
							.project({ groupName: 1, groupSuffix: 1, _id: 0 })
							.toArray()
						)
						.then((names) => GlobalSendCustom(200, names))
						.catch(Logging);
					break;

					case "certain":
						if (typeof queries["name"] !== "string")
							return GlobalSendCustom(400, {error: true, message: "No required <name> parameter"});

						const selector = {
							groupName: queries["name"]
						};

						if (queries["suffix"] && typeof queries["suffix"] === "string")
							selector["groupSuffix"] = queries["suffix"];

						mongoDispatcher.callDB()
						.then((DB) =>
							DB.collection("study_groups")
							.find(selector)
							.sort({ groupName: 1, groupSuffix: 1 })
							.project({ _id: 0 })
							.toArray()
						)
						.then((groups) => {
							if (!groups.length)
								GlobalSendCustom(404, []);
							else
								GlobalSendCustom(200, groups);
						})
						.catch(Logging);
					break;

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
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

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
			break;

			default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
		}
	} else if (path[1] === "v1.2") {
		switch (path[2]) {
			case "groups":
				switch (path[3]) {
					case "all":
						mongoDispatcher.callDB()
						.then((DB) =>
							DB.collection("study_groups")
							.find()
							.sort({ groupName: 1, groupSuffix: 1 })
							.project({ groupName: 1, groupSuffix: 1, _id: 0 })
							.toArray()
						)
						.then((names) => GlobalSendCustom(200, names))
						.catch(Logging);
					break;

					case "certain":
						if (typeof queries["name"] !== "string")
							return GlobalSendCustom(400, {error: true, message: "No required <name> parameter"});

						const selector = {
							groupName: queries["name"]
						};

						if (queries["suffix"] && typeof queries["suffix"] === "string")
							selector["groupSuffix"] = queries["suffix"];

						mongoDispatcher.callDB()
						.then((DB) =>
							DB.collection("study_groups")
							.find(selector)
							.sort({ groupName: 1, groupSuffix: 1 })
							.project({ _id: 0 })
							.toArray()
						)
						.then((groups) => {
							if (!groups.length)
								GlobalSendCustom(404, []);
							else
								GlobalSendCustom(200, groups);
						})
						.catch(Logging);
					break;

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
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

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
			break;

			case "logs":
				switch (path[3]) {
					case "post":
						GlobalSend(201);
					break;

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
			break;

			default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
		}
	} else if (path[1] === "v1.3") {
		switch (path[2]) {
			case "groups":
				switch (path[3]) {
					case "all":
						mongoDispatcher.callDB()
						.then((DB) =>
							DB.collection("study_groups")
							.find()
							.sort({ groupName: 1, groupSuffix: 1 })
							.project({ groupName: 1, groupSuffix: 1, _id: 0 })
							.toArray()
						)
						.then((names) => GlobalSendCustom(200, names))
						.catch(Logging);
					break;

					case "certain":
						if (typeof queries["name"] !== "string")
							return GlobalSendCustom(400, {error: true, message: "No required <name> parameter"});

						const selector = {
							groupName: queries["name"]
						};

						if (queries["suffix"] && typeof queries["suffix"] === "string")
							selector["groupSuffix"] = queries["suffix"];

						mongoDispatcher.callDB()
						.then((DB) =>
							DB.collection("study_groups")
							.find(selector)
							.sort({ groupName: 1, groupSuffix: 1 })
							.project({ _id: 0 })
							.toArray()
						)
						.then((groups) => {
							if (!groups.length)
								GlobalSendCustom(404, []);
							else
								GlobalSendCustom(200, groups);
						})
						.catch(Logging);
					break;

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
			break;

			case "time":
				switch (path[3]) {
					case "startTime":
						mongoDispatcher.callDB()
						.then((DB) => DB.collection("params").findOne({ name: "start_of_weeks" }))
						.then((found) => {
							if (found && found.value)
								GlobalSendCustom(200, new Date(found.value).toISOString());
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

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
			break;

			case "stats":
				mongoDispatcher.callDB()
				.then((DB) => 
					DB.collection("params").findOne({ name: "scrapper_updated_date" })
					.then((scrapperUpdatedDate) => {
						if (scrapperUpdatedDate)
							return DB.collection("study_groups").countDocuments().then((groupsCount) => {
								GlobalSendCustom(200, {
									scrapperUpdatedDate: new Date(scrapperUpdatedDate.value || 0).toISOString(),
									groupsCount
								});
							});
						else
							GlobalSendCustom(404, "Property scrapper_updated_date not found");
					})
				)
				.catch(Logging);
			break;

			case "logs":
				switch (path[3]) {
					case "post":
						GlobalSend(201);
					break;

					default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
				}
			break;

			default: GlobalSendCustom(404, {error: true, message: "No such method"}); break;
		}
	} else
		return GlobalSendCustom(400, {error: true, message: "No such API version"});
};
