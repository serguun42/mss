const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		GITHUB_HOOK_KEY,
		GITHUB_CI_SCRIPT
	} = DEV ? require("../../../DEV_CONFIGS/backend.config.json") : require("../backend.config.json"),
	Logging = require("../utils/logging"),
	{ spawn } = require("child_process");


let lastTimeMasterChanged = Date.now();

const GlobalRunCIScript = () => {
	Logging(`Starting CI script. If there is nothing else in couple of minutes, you are dead. Go see the logs at server!`);

	const flagsForSpawningProcess = GITHUB_CI_SCRIPT.slice(1),
		  ciProcess = spawn(GITHUB_CI_SCRIPT[0], flagsForSpawningProcess);

	ciProcess.stderr.on("data", (data) => Logging(new Error(data?.toString() || data)));

	ciProcess.on("close", (code) => {
		if (erroredOrClosed) return;
		erroredOrClosed = true;

		if (code === 0) {
			Logging(`CI process ran successfully`);
		} else {
			Logging(`CI process ended with code = ${code}`);
		}

		Logging("Exiting this node process");
		process.exit(0);
	});

	ciProcess.on("error", (e) => {
		if (erroredOrClosed) return;
		erroredOrClosed = true;

		Logging(`CI process errored`, e);
	});
}


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

				GlobalSend(200);

				if (payloadParsed.ref !== "refs/heads/master" && payloadParsed.ref !== "refs/heads/main") return false;
				Logging(`Git hook with ref = refs/heads/master`);


				lastTimeMasterChanged = Date.now();

				setTimeout(() => {
					if (lastTimeMasterChanged + 10e3 > Date.now())
						Logging(`Skipping CI script starting at because there is new one!`);
					else
						GlobalRunCIScript();
				}, 10e3);
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
