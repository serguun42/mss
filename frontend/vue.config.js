const webpack = require("webpack");
const WIN = require("os").platform() === "win32";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { optimize } = require("svgo");
const WebpackSWPlugin = require("@serguun42/webpack-service-worker-plugin");

/**
 * @param {string[]} pathToFile
 * @returns {string}
 */
const ReadFileSafe = (...pathToFile) => {
	if (pathToFile instanceof Array) pathToFile = path.join(...pathToFile);
	if (typeof pathToFile !== "string") return "";

	try {
		const stats = fs.statSync(pathToFile);
		if (!stats.isFile()) throw new Error("No tag manager file");

		return fs.readFileSync(pathToFile).toString();
	} catch (e) {
		return "";
	}
}

/**
 * @param {string} plain
 * @returns {string}
 */
const ReplaceWithEnvVariables = (plain) => plain.replace(/<%= ([\w\.]+) %>/gi, (_match, group) => {
	if (dotenvPlugin?.definitions?.[group]) {
		try {
			return JSON.parse(dotenvPlugin.definitions[group]);
		} catch (e) {
			return dotenvPlugin.definitions[group];
		}
	}

	try {
		return JSON.parse(dotenvPlugin?.definitions?.[`process.env.${group}`]);
	} catch (e) {
		return dotenvPlugin?.definitions?.[`process.env.${group}`];
	}
});

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
			newManifestPart[key] = ReplaceWithEnvVariables(iManifestLevel[key]);
		else
			newManifestPart[key] = iManifestLevel[key];
	});

	return newManifestPart;
};


const DotenvWebpackPlugin = require("dotenv-webpack");
const dotenvPlugin = new DotenvWebpackPlugin({
	path: "./.env",
	safe: false,
	systemvars: true
});

const BUILD_HASH = crypto.createHash("sha256").update(Date.now().toString() + "SOME_SALT_FOR_HASH").digest("hex");
fs.writeFileSync(path.join("public", "version.txt"), `BUILD_HASH=${BUILD_HASH}`);
const TAG_MANAGER = ReadFileSafe("src", "config", "tag-manager.html");
const routes = require("./src/router/routes");

const buildDefinePlugin = new webpack.DefinePlugin({
	"process.env.BUILD_HASH": JSON.stringify(BUILD_HASH),
	"process.env.TAG_MANAGER": JSON.stringify(TAG_MANAGER),
	"process.env.ROUTES": JSON.stringify(routes.map((route) => route.path)),
});

const BASE_MANIFEST = require("./src/config/manifest.base.json");
const OUTPUT_MANIFEST = ManifestTemplateHandler(BASE_MANIFEST);
fs.writeFileSync(path.join("public", "manifest.json"), JSON.stringify(OUTPUT_MANIFEST, false, "\t"));
fs.writeFileSync(path.join("public", "manifest.webmanifest"), JSON.stringify(OUTPUT_MANIFEST, false, "\t"));


const BASE_SITEMAP = require("./src/config/sitemap.base.json");
const DATE_SITEMAP = new Date().toISOString();
const OUTPUT_SITEMAP = BASE_SITEMAP.WRAP.replace(
	"__ITEMS__",
	[""].concat(
		routes
		.filter((route) => route.path?.length > 1 && !route.meta?.noIndex)
		.map((route) => route.path)
	).concat("/docs/api/redoc")
	.map((path) => BASE_SITEMAP.ITEM.replace("__ROUTE__", path).replace("__DATE__", DATE_SITEMAP))
	.join("\n")
);
fs.writeFileSync(path.join("public", "sitemap.xml"), ReplaceWithEnvVariables(OUTPUT_SITEMAP));

const BASE_ROBOTS = ReadFileSafe("src", "config", "robots.base.txt");
fs.writeFileSync(path.join("public", "robots.txt"), ReplaceWithEnvVariables(BASE_ROBOTS));

const MAP_FLOORS = Array.from({ length: 5 }, (_, idx) =>
		[idx.toString(), `${idx}_dark`]
	).flat().map((floorName) => ({
		floorName,
		svgPlain: optimize(ReadFileSafe("src", "map", `${floorName}.svg`), {
			plugins: [
				{
					name: 'cleanupIDs',
					active: false
				}
			]
		}).data
	}));
fs.writeFileSync(path.join("public", "maps.json"), JSON.stringify(MAP_FLOORS));

/** @type {"development" | "production"} */
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
			buildDefinePlugin
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
			buildDefinePlugin,
			new WebpackSWPlugin({
				source: "src/service-worker.js",
				output: "service-worker.js",
			})
		],
	},

    productionSourceMap: false
}
