const webpack = require("webpack");
const WIN = require("os").platform() === "win32";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


const BUILD_HASH = crypto.createHash("sha256").update(Date.now().toString() + "SOME_SALT_FOR_HASH").digest("hex");
fs.writeFileSync(path.join("public", "version.txt"), `BUILD_HASH=${BUILD_HASH}`);

const TAG_MANAGER_LOCATION = path.join("src", "config", "tag-manager.html");

let tagManager = "";
try {
	const stats = fs.statSync(TAG_MANAGER_LOCATION);
	if (!stats.isFile()) throw new Error("No tag manager file");

	tagManager = fs.readFileSync(TAG_MANAGER_LOCATION).toString();
} catch (e) {
	console.log("Skipping tag manager");
}


const DotenvWebpackPlugin = require("dotenv-webpack");
const dotenvPlugin = new DotenvWebpackPlugin({
	path: "./.env",
	safe: false,
	systemvars: true
});
const buildHashEnvPlugin = new webpack.DefinePlugin({
	"process.env.BUILD_HASH": JSON.stringify(BUILD_HASH),
	"process.env.TAG_MANAGER": JSON.stringify(tagManager)
});



const EXAMPLE_MANIFEST = require("./src/config/manifest.example.json");

/**
 * @typedef {{[prop: string]: string | number | null | ManifesType}} ManifesType
 * 
 * @param {ManifesType} iManifestLevel
 */
const ManifestTemplateHandler = (iManifestLevel) => {
	const newManifestPart = {};

	Object.keys(iManifestLevel).forEach((key) => {
		if (typeof iManifestLevel[key] === "object") {
			if (iManifestLevel[key] instanceof Array)
				newManifestPart[key] = iManifestLevel[key].map((subValue) => ManifestTemplateHandler(subValue));
			else
				newManifestPart[key] = ManifestTemplateHandler(iManifestLevel[key]);
		} else if (typeof iManifestLevel[key] === "string")
			newManifestPart[key] = iManifestLevel[key].replace(/<%= ([\w\.]+) %>/gi, (match, group) => {
				if (dotenvPlugin?.definitions?.[group]) {
					try {
						return JSON.parse(dotenvPlugin.definitions[group]);
					} catch (e) {
						return dotenvPlugin.definitions[group];
					};
				};
				
				try {
					return JSON.parse(dotenvPlugin?.definitions?.[`process.env.${group}`]);
				} catch (e) {
					return dotenvPlugin?.definitions?.[`process.env.${group}`];
				};
			});
		else
			newManifestPart[key] = iManifestLevel[key];
	});

	return newManifestPart
};

const OUTPUT_MANIFEST = ManifestTemplateHandler(EXAMPLE_MANIFEST);
fs.writeFileSync(path.join("public", "manifest.json"), JSON.stringify(OUTPUT_MANIFEST, false, "\t"));
fs.writeFileSync(path.join("public", "manifest.webmanifest"), JSON.stringify(OUTPUT_MANIFEST, false, "\t"));




/** @type {"development"|"production"} */
const MODE = process.env.NODE_ENV;

/** @type {{ configureWebpack: webpack.Configuration }} */
module.exports = MODE === "development" ? {
	configureWebpack: {
		mode: "development",
		output: {
			pathinfo: false
		},
		plugins: [
			dotenvPlugin,
			buildHashEnvPlugin
		],
		devServer: WIN ? {
			host: "localhost",
			https: true,
			key: fs.readFileSync("../../DEV_CONFIGS/certs/localhost.key"),
			cert: fs.readFileSync("../../DEV_CONFIGS/certs/localhost.crt"),
			port: 5057
		} : null
	},

	productionSourceMap: true
} : {
    configureWebpack: {
		mode: "production",
		output: {
			pathinfo: false
		},
		plugins: [
			dotenvPlugin,
			buildHashEnvPlugin
		],
	},

    productionSourceMap: false
}
