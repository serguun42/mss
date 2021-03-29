const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		CERTS,
		GIT_HOOK_PORT,
		GIT_HOOK_KEY,
		CI_SCRIPT
	} = DEV ? require("../../DEV_CONFIGS/ci.config.json") : require("./ci.config.json"),
	Logging = require("./utils/logging"),
	{ spawn } = require("child_process");


let lastTimeMasterChanged = Date.now();

const GlobalRunCIScript = () => {
	Logging(`Starting CI script. If there is nothing else in couple of minutes, you are dead. Go see the logs at server!`);

	const ciScriptProcess = spawn(CI_SCRIPT.executing_shell, [ CI_SCRIPT.filename ]);

	ciScriptProcess.stderr.on("data", (data) => {
		if (data && data.toString && data.toString().length)
			console.warn(data.toString());
	});


	let erroredOrClosed = false;

	ciScriptProcess.on("close", (code) => {
		if (erroredOrClosed) return;
		erroredOrClosed = true;

		setTimeout(() => {
			if (code === 0) {
				Logging(`CI process ran successfully`);
			} else {
				Logging(`CI process ended with code ${code}`);
			}
		}, 10e3);
	});

	ciScriptProcess.on("error", (e) => {
		if (erroredOrClosed) return;
		erroredOrClosed = true;

		console.warn(`CI process errored`, e);
	});
};


const
	https = require("https"),
	fs = require("fs");

const HTTPS_SERVER_OPTIONS = {
	key: fs.readFileSync(CERTS.key),
	cert: fs.readFileSync(CERTS.cert)
};


https.createServer(HTTPS_SERVER_OPTIONS, (req, res) => {
	if (req.method !== "POST") {
		res.statusCode = 405;
		res.end("405 Method Not Allowed");
		return;
	}

	if (req.url !== `/git-hook-key=${GIT_HOOK_KEY}`) {
		res.statusCode = 403;
		res.end("403 Forbidden");
		return;
	}

	new Promise((resolve, reject) => {
		const chunks = [];

		req.on("data", (chunk) => chunks.push(chunk));

		req.on("error", (e) => reject(e));

		req.on("end", () => resolve(Buffer.concat(chunks)));
	}).then(/** @param {Buffer} iRequestBuffer */ (iRequestBuffer) => {
		const payloadString = iRequestBuffer.toString();

		try {
			const payloadParsed = JSON.parse(payloadString);

			if (payloadParsed.ref !== "refs/heads/master" && payloadParsed.ref !== "refs/heads/main") {
				res.statusCode = 200;
				res.end("Not our case");
				return;
			};

			res.statusCode = 200;
			res.end(`Git hook with ref "refs/heads/master". So starting waiting to start CI script.`);

			Logging(`Git hook with ref "refs/heads/master". So starting waiting to start CI script.`);


			lastTimeMasterChanged = Date.now();

			setTimeout(() => {
				if (lastTimeMasterChanged + 10e3 > Date.now())
					Logging(`Skipping CI script starting at because there is new one!`);
				else
					GlobalRunCIScript();
			}, 10e3);
		} catch (e) {
			Logging(`Cannot parse git hook`, e);

			res.statusCode = 406;
			res.end("406 Not Acceptable");
		};
	}).catch((e) => {
		Logging(`Git hook post method failed`, e);

		res.statusCode = 500;
		res.end("500 Internal Server Error");
	});
}).listen(GIT_HOOK_PORT);
