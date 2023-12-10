import fetch from "node-fetch";
import readConfig from "../util/read-config.js";

const PANEL_CONFIG = readConfig();

/**
 * @param {string} token
 * @returns {Promise<void>}
 */
export default function validateAccessToken(token) {
  if (!token) return Promise.reject(new Error("No token was passed"));

  return fetch(
    `${PANEL_CONFIG.KEYCLOAK_ORIGIN}/realms/${PANEL_CONFIG.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "User-Agent": "MSS-Panel/1.0.0",
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then((res) => {
      if (!res.ok)
        return res.text().then(
          (text) => Promise.reject(new Error(`Keycloak returned ${res.status} ${res.statusText} – ${text}`)),
          () => () => Promise.reject(new Error(`Keycloak returned ${res.status} ${res.statusText}`))
        );

      return res.json();
    })
    .then(
      /** @param {import('../types').UserInfo} userInfo */ (userInfo) =>
        userInfo.email_verified && userInfo.email === PANEL_CONFIG.PANEL_USER_EMAIL
          ? Promise.resolve()
          : Promise.reject(new Error("Email validation failed"))
    );
}
