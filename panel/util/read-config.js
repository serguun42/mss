import { readFileSync } from "node:fs";
import IS_DEV from "./is-dev.js";

/** @type {{ panel?: string }} */
const CONFIG_HOT_STORAGE = {};

/**
 * Read config based on ENV
 *
 * @returns {import('../types').PanelConfig}
 */
export default function ReadConfig() {
  const configFileLocation = (IS_DEV && process.env.CONFIG_LOCATION) || "./panel.config.json";

  try {
    const readConfig = readFileSync(configFileLocation).toString();
    CONFIG_HOT_STORAGE.panel = readConfig;
    return JSON.parse(readConfig);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
