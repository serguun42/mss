
const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		GITHUB_HOOK_KEY
	} = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json"),
	Logging = require("../utils/logging");

/**
 * @param {import("../utils/urls-and-cookies").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { req, queries, GlobalSend } = iModuleDataObject;

	if (queries["git-hook-key"] !== GITHUB_HOOK_KEY) return GlobalSend(403);

	if (req.method === "POST") {
		new Promise((resolve, reject) => {
			const chunks = [];

			req.on("data", (chunk) => chunks.push(chunk));

			req.on("error", (e) => reject(e));

			req.on("end", () => resolve(Buffer.concat(chunks)));
		}).then(/** @param {Buffer} iRequestBuffer */ (iRequestBuffer) => {
			const payloadString = iRequestBuffer.toString();

			try {
				const payloadParsed = JSON.parse(payloadString);
				console.log(`Git post hook:`, JSON.stringify(payloadParsed, false, "\t"));

				GlobalSend(200);
			} catch (e) {
				Logging(`Cannot parse git hook`, e);

				GlobalSend(406);
			};
		}).catch((e) => {
			Logging(`Git hook post method failed`, e);

			GlobalSend(500);
		});
	} else
		GlobalSend(405);
};
