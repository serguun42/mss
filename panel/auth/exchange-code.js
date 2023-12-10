import fetch from "node-fetch";
import readConfig from "../util/read-config.js";

const PANEL_CONFIG = readConfig();

/**
 * @param {string} code
 * @returns {Promise<string>}
 */
export default function exchangeCodeToToken(code) {
  if (!code) return Promise.reject(new Error("No code was passed"));

  return fetch(`${PANEL_CONFIG.KEYCLOAK_ORIGIN}/realms/${PANEL_CONFIG.KEYCLOAK_REALM}/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "MSS-Panel/1.0.0"
    },
    body: `client_id=${encodeURIComponent(PANEL_CONFIG.KEYCLOAK_CLIENT_ID)}&client_secret=${encodeURIComponent(
      PANEL_CONFIG.KEYCLOAK_CLIENT_SECRET
    )}&grant_type=authorization_code&scope=${encodeURIComponent(
      ["openid", "profile"].join(" ")
    )}&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(PANEL_CONFIG.PANEL_ORIGIN)}`
  })
    .then((res) => {
      if (!res.ok)
        return res.text().then(
          (text) => Promise.reject(new Error(`Keycloak returned ${res.status} ${res.statusText} – ${text}`)),
          () => () => Promise.reject(new Error(`Keycloak returned ${res.status} ${res.statusText}`))
        );

      return res.json();
    })
    .then(
      /** @param {import('../types').TokenResponse} tokenResponse */ (tokenResponse) =>
        Promise.resolve(tokenResponse.access_token)
    );
}
