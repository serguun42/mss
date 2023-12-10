import { createServer } from "http";
import readConfig from "./util/read-config.js";
import exchangeCodeToToken from "./auth/exchange-code.js";
import logging from "./util/logging.js";
import validateAccessToken from "./auth/validate-token.js";
import serveStatic from "./static/serve-static.js";
import DB_METHODS from "./database/methods.js";
import readPayload from "./util/read-payload.js";
import { parseCookies, parsePath, parseQuery } from "./util/urls-and-cookies.js";
import fetch from "node-fetch";
import { equal } from "assert";

const PANEL_CONFIG = readConfig();

const IS_PANEL_ORIGIN_SECURE = new URL(PANEL_CONFIG.PANEL_ORIGIN).protocol === "https:";

createServer((req, res) => {
  const method = req.method;
  const requestedURL = req.url;
  const path = parsePath(req.url);
  const queries = parseQuery(req.url);
  const cookies = parseCookies(req.headers);

  const sendError = () => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("500 Internal Server Error");
  };

  const sendForbidden = () => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("403 Forbidden");
  };

  const redirectToLoginPage = () => {
    const loginPage = `${PANEL_CONFIG.KEYCLOAK_ORIGIN}/realms/${PANEL_CONFIG.KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${PANEL_CONFIG.KEYCLOAK_CLIENT_ID}&scope=openid%20profile&redirect_uri=${PANEL_CONFIG.PANEL_ORIGIN}&response_type=code`;

    res.statusCode = 302;
    res.setHeader("Location", loginPage);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Go to ${loginPage}`);
  };

  validateAccessToken(cookies.access_token)
    .then(() => {
      if (path[0] === "params-panel" || path[0] === "favicon.ico") {
        if (path[1] === "api" && path[2] === "list") {
          if (method !== "GET") {
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
              logging(e);
              sendError();
            });
        }

        if (path[1] === "api" && path[2] === "set") {
          if (method !== "POST") {
            res.statusCode = 405;
            res.end("405 Method Not Allowed");
            return;
          }

          return readPayload(req)
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
              logging(e);
              sendError();
            });
        }

        if (method !== "GET") {
          res.statusCode = 405;
          res.end("405 Method Not Allowed");
          return;
        }

        serveStatic(req, res);
        return;
      }

      fetch(new URL(requestedURL, PANEL_CONFIG.GRAFANA_ORIGIN).href, {
        method,
        headers: req.headers,
        body: method === "GET" ? undefined : req
      })
        .then((grafanaResponse) => {
          res.statusCode = grafanaResponse.status;
          res.statusMessage = grafanaResponse.statusText;
          for (const [name, value] of grafanaResponse.headers) res.setHeader(name, value);

          grafanaResponse.body.pipe(res);
        })
        .catch(() => sendError());
    })
    .catch(() => {
      if ("session_state" in queries && queries.code) {
        exchangeCodeToToken(queries.code)
          .then((token) => {
            res.setHeader(
              "Set-Cookie",
              `access_token=${encodeURIComponent(token)}; Expires=${new Date(
                Date.now() + PANEL_CONFIG.PANEL_COOKIE_TTL_SECONDS * 1000
              ).toUTCString()}; ${IS_PANEL_ORIGIN_SECURE ? "Secure; " : ""}HttpOnly; SameSite=Strict`
            );

            serveStatic(req, res);
          })
          .catch((e) => {
            console.warn(e);
            sendForbidden();
          });

        return;
      }

      redirectToLoginPage();
    });
}).listen(80);
