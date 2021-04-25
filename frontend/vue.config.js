const webpack = require("webpack");
const WIN = require("os").platform() === "win32";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


const BUILD_HASH = crypto.createHash("sha256").update(Date.now().toString() + "SOME_SALT_FOR_HASH").digest("hex");
fs.writeFileSync(path.join("public", "version.txt"), `BUILD_HASH=${BUILD_HASH}`);


const DotenvWebpackPlugin = require("dotenv-webpack");
const dotenvPlugin = new DotenvWebpackPlugin({
	path: "./.env",
	safe: false,
	systemvars: true
});
const dotenvPluginForBuildHash = new DotenvWebpackPlugin({
	path: "./public/version.txt",
	safe: false,
	systemvars: true
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

module.exports = MODE === "development" ? {
	configureWebpack: {
		mode: "development",
		output: {
			pathinfo: false
		},
		plugins: [
			dotenvPlugin,
			dotenvPluginForBuildHash
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
			dotenvPluginForBuildHash
		],
	},

    productionSourceMap: false
}
