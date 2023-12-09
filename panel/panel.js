import { createServer } from "http";
import ReadConfig from "./util/read-config.js";
import GetQueryParams from "./util/get-query-params.js";
import GetCookies from "./util/get-cookies.js";
import ExchangeCodeToToken from "./auth/exchange-code.js";
import Logging from "./util/logging.js";
import ValidateAccessToken from "./auth/validate-token.js";
import ServeStatic from "./static/serve-static.js";
import DB_METHODS from "./database/methods.js";
import ReadPayload from "./util/read-payload.js";

const PANEL_CONFIG = ReadConfig();

const IS_PANEL_ORIGIN_SECURE = new URL(PANEL_CONFIG.PANEL_ORIGIN).protocol === "https:";

createServer((req, res) => {
  const method = req.method;
  const path = req.url;
  const queries = GetQueryParams(req.url);
  const cookies = GetCookies(req.headers);

  const SendError = () => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("500 Internal Server Error");
  };

  const SendForbidden = () => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("403 Forbidden");
  };

  const RedirectToLoginPage = () => {
    const loginPage = `${PANEL_CONFIG.KEYCLOAK_ORIGIN}/realms/${PANEL_CONFIG.KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${PANEL_CONFIG.KEYCLOAK_CLIENT_ID}&scope=openid%20profile&redirect_uri=${PANEL_CONFIG.PANEL_ORIGIN}&response_type=code`;

    res.statusCode = 302;
    res.setHeader("Location", loginPage);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Go to ${loginPage}`);
  };

  ValidateAccessToken(cookies.access_token)
    .then(() => {
      if (path === "/list") {
        if (method !== "POST") {
          res.statusCode = 405;
          res.end("405 Method Not Allowed");
          return;
        }

        return DB_METHODS.listAllParams()
          .then((params) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(params));
          })
          .catch((e) => {
            Logging(e);
            SendError();
          });
      }

      if (path === "/set") {
        if (method !== "POST") {
          res.statusCode = 405;
          res.end("405 Method Not Allowed");
          return;
        }

        return ReadPayload(req)
          .then((readBuffer) => {
            try {
              return Promise.resolve(JSON.parse(readBuffer.toString()));
            } catch (e) {
              return Promise.reject(new Error("Malformed JSON"));
            }
          })
          .then((payload) => DB_METHODS.setParam(payload))
          .then((updatedNumber) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ updatedNumber }));
          })
          .catch((e) => {
            Logging(e);
            SendError();
          });
      }

      if (method !== "GET") {
        res.statusCode = 405;
        res.end("405 Method Not Allowed");
        return;
      }

      ServeStatic(req, res);
    })
    .catch(() => {
      if ("session_state" in queries && queries.code) {
        ExchangeCodeToToken(queries.code)
          .then((token) => {
            res.setHeader(
              "Set-Cookie",
              `access_token=${encodeURIComponent(token)}; Expires=${new Date(
                Date.now() + PANEL_CONFIG.PANEL_COOKIE_TTL_SECONDS * 1000
              ).toUTCString()}; ${IS_PANEL_ORIGIN_SECURE ? "Secure; " : ""}HttpOnly; SameSite=Strict`
            );

            ServeStatic(req, res);
          })
          .catch((e) => {
            console.warn(e);
            SendForbidden();
          });

        return;
      }

      RedirectToLoginPage();
    });
}).listen(80);
