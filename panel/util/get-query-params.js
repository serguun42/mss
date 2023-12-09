import ReadConfig from "./read-config.js";

const PANEL_CONFIG = ReadConfig();

/**
 * @param {string} reqURL
 * @returns {{ [queryParam: string]: string }}
 */
export default function GetQueryParams(reqURL) {
  /** @type {{ [queryParam: string]: string }} */
  const params = {};

  try {
    const parsedURL = new URL(reqURL, PANEL_CONFIG.PANEL_ORIGIN);

    Array.from(parsedURL.searchParams).forEach(([key, value]) => {
      params[key] = value;
    });
  } catch (e) {}

  return params;
}
