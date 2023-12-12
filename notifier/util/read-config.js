import { readFileSync } from "node:fs";
import IS_DEV from "./is-dev.js";

/** @type {{ lastReadValue?: string }} */
const CONFIG_HOT_STORAGE = {};

/**
 * Read config based on ENV
 *
 * @returns {import('../types/index.js').NotifierConfig}
 */
export default function readConfig() {
  const configFileLocation = (IS_DEV && process.env.CONFIG_LOCATION) || "./notifier.config.json";

  try {
    if (!CONFIG_HOT_STORAGE.lastReadValue)
      CONFIG_HOT_STORAGE.lastReadValue = readFileSync(configFileLocation).toString();
    return JSON.parse(CONFIG_HOT_STORAGE.lastReadValue);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
