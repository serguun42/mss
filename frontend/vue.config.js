const { createHash } = require("crypto");
const { resolve } = require("path");
const { statSync, readFileSync } = require("fs");
const { writeFile } = require("fs/promises");
const { optimize } = require("svgo");
const { DefinePlugin } = require("webpack");
const WebpackSWPlugin = require("@serguun42/webpack-service-worker-plugin");

/**
 * @param {string} path
 * @returns {string}
 */
const ReadFileSafe = (path) => {
  try {
    const stats = statSync(path);
    if (!stats.isFile()) throw new Error(`${path} is not a file`);

    return readFileSync(path).toString();
  } catch (_) {
    return "";
  }
};

/**
 * @param {string} path
 * @param {any} data
 * @returns {Promise}
 */
const WriteFileSafe = (path, data) =>
  writeFile(path, data).catch((e) => {
    process.stderr.write(`Cannot save ${path}`, e);
    return Promise.resolve();
  });

/**
 * @param {string} plain
 * @returns {string}
 */
const ReplaceWithEnvVariables = (plain) =>
  plain
    .replace(/\$(?<variableName>\w+)/g, (match, variableName) => process.env[variableName] || match)
    .replace(/<%= (?<variableName>\w+) %>/g, (_match, variableName) => process.env[variableName] || variableName);

/** Environment variables */
const BUILD_HASH = createHash("md5").update(`BUILDSALT-${Date.now()}`).digest("hex");
const TAG_MANAGER = ReadFileSafe(resolve("src", "config", "tag-manager.html"));
const ROUTES = require("./src/router/routes");

/** Saving as `VUE_APP_…` so it'd be accessible from within Vue code */
process.env.VUE_APP_BUILD_HASH = BUILD_HASH;
WriteFileSafe(resolve("public", "build_hash"), BUILD_HASH);

const IS_DEV = process.env.NODE_ENV === "development";
const DOT_ENV_PATH = resolve("src", "config", `${IS_DEV ? "local" : "production"}.env`);
const ENVIRONMENT_FILE = ReplaceWithEnvVariables(ReadFileSafe(DOT_ENV_PATH));

ENVIRONMENT_FILE.split("\n").forEach((line) => {
  if (line.search("=") < 0) return;

  const [name, ...value] = line.split("=");

  process.env[name] = value.join("=");
});

if (IS_DEV && !process.env.GITHUB_RUN_NUMBER) process.env.GITHUB_RUN_NUMBER = "DEV";
process.env.VUE_APP_RUN_NUMBER = process.env.GITHUB_RUN_NUMBER ?? new Date().toISOString().split("T")[0];

const definePlugin = new DefinePlugin({
  DEFINED_TAG_MANAGER: JSON.stringify(TAG_MANAGER),
  DEFINED_ROUTES: JSON.stringify(ROUTES.map((route) => route.path))
});

/**
 * @typedef {{[prop: string]: string | number | null | ManifestType}} ManifestType
 *
 * @param {ManifestType} manifestLevel
 */
const ManifestTemplateHandler = (manifestLevel) => {
  const newManifestPart = {};

  Object.keys(manifestLevel).forEach((key) => {
    if (typeof manifestLevel[key] === "object") {
      if (manifestLevel[key] instanceof Array)
        newManifestPart[key] = manifestLevel[key].map((subValue) => ManifestTemplateHandler(subValue));
      else newManifestPart[key] = ManifestTemplateHandler(manifestLevel[key]);
    } else if (typeof manifestLevel[key] === "string")
      newManifestPart[key] = ReplaceWithEnvVariables(manifestLevel[key]);
    else newManifestPart[key] = manifestLevel[key];
  });

  return newManifestPart;
};

const MANIFEST_BASE = require("./src/config/manifest.base.json");
const builtManifest = ManifestTemplateHandler(MANIFEST_BASE);

WriteFileSafe(resolve("public", "manifest.json"), JSON.stringify(builtManifest, false, "\t"));
WriteFileSafe(resolve("public", "manifest.webmanifest"), JSON.stringify(builtManifest, false, "\t"));

const BASE_SITEMAP = require("./src/config/sitemap.base.json");
const DATE_SITEMAP = new Date().toISOString();
const builtSitemap = BASE_SITEMAP.WRAP.replace(
  "__ITEMS__",
  [""]
    .concat(ROUTES.filter((route) => route.path?.length > 1 && !route.meta?.noIndex).map((route) => route.path))
    .concat("/docs/api/redoc")
    .map((path) => BASE_SITEMAP.ITEM.replace("__ROUTE__", path).replace("__DATE__", DATE_SITEMAP))
    .join("\n")
);
WriteFileSafe(resolve("public", "sitemap.xml"), ReplaceWithEnvVariables(builtSitemap));

const BASE_ROBOTS = ReadFileSafe(resolve("src", "config", "robots.base.txt"));
WriteFileSafe(resolve("public", "robots.txt"), ReplaceWithEnvVariables(BASE_ROBOTS));

const mapFloors = Array.from({ length: 5 }, (_, idx) => [idx.toString(), `${idx}_dark`])
  .flat()
  .map((floorName) => ({
    floorName,
    svgPlain: optimize(ReadFileSafe(resolve("src", "map", `${floorName}.svg`)), {
      plugins: [
        {
          name: "cleanupIDs",
          active: false
        }
      ]
    }).data
  }));
WriteFileSafe(resolve("public", "maps.json"), JSON.stringify(mapFloors));

/** @type {import("webpack").ResolveOptions} */
const WEBPACK_RESOLVE_OPTIONS = {
  alias: {
    "@": resolve("src")
  },
  fallback: {
    fs: false
  }
};

/** @type {import("@vue/cli-service").ProjectOptions} */
const DEV_VUE_CONFIG = {
  /** @type {import("webpack").Configuration} */
  configureWebpack: {
    mode: "development",
    output: {
      pathinfo: false
    },
    resolve: WEBPACK_RESOLVE_OPTIONS,
    plugins: [definePlugin],
    devServer: {
      host: "localhost",
      port: process.env.DEV_LOCAL_PORT,

      server:
        process.env.DEV_LOCAL_HTTPS_KEY_PATH && process.env.DEV_LOCAL_HTTPS_CERT_PATH
          ? {
              type: "https",
              options: {
                key: ReadFileSafe(process.env.DEV_LOCAL_HTTPS_KEY_PATH),
                cert: ReadFileSafe(process.env.DEV_LOCAL_HTTPS_CERT_PATH)
              }
            }
          : undefined
    }
  },

  publicPath: process.env.VUE_APP_RELATIVE_PATH,

  productionSourceMap: true
};

/** @type {import("@vue/cli-service").ProjectOptions} */
const PROD_VUE_CONFIG = {
  configureWebpack: {
    mode: "production",
    output: {
      pathinfo: false
    },
    resolve: WEBPACK_RESOLVE_OPTIONS,
    plugins: [
      definePlugin,
      new WebpackSWPlugin({
        source: "src/service-worker.js",
        output: "service-worker.js"
      })
    ]
  },

  publicPath: process.env.VUE_APP_RELATIVE_PATH,

  productionSourceMap: false
};

module.exports = IS_DEV ? DEV_VUE_CONFIG : PROD_VUE_CONFIG;
