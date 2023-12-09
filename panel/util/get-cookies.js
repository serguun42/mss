import ReadConfig from "./read-config.js";

/**
 * @param {Record<string, string>} reqHeaders
 * @returns {{ [cookieName: string]: string }}
 */
export default function GetCookies(reqHeaders) {
  const cookies = {};

  if (reqHeaders.cookie)
    reqHeaders.cookie.split(";").forEach((cookie) => {
      const [cookieName, cookieValue] = cookie.split("=");

      try {
        cookies[cookieName.trim()] = decodeURIComponent(cookieValue.trim());
      } catch (e) {
        cookies[cookieName.trim()] = cookieValue.trim();
      }
    });

  return cookies;
}
