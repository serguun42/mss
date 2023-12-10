import { createServer, STATUS_CODES } from "node:http";
import { parsePath, parseQuery } from "./util/urls-and-cookies.js";
import coreAPIModule from "./api/core.js";

export default function createBackendServer() {
  return createServer((req, res) => {
    const path = parsePath(req.url);
    const queries = parseQuery(req.url);

    res.setHeader("Content-Type", "text/plain; charset=UTF-8");

    /**
     * @param {number} code
     * @param {string | Buffer | ReadStream | Object} data
     */
    const sendPayload = (code, data) => {
      res.statusCode = code;

      if (data instanceof Buffer || typeof data == "string") {
        const dataToSend = data.toString();

        res.end(dataToSend);
      } else {
        const dataToSend = JSON.stringify(data);
        res.setHeader("Content-Type", "application/json; charset=UTF-8");

        res.end(dataToSend);
      }
    };

    /** @param {number} code */
    const sendCode = (code) => {
      res.statusCode = code || 200;
      res.end(`${code || 500} ${STATUS_CODES[code || 500]}`);
    };

    /** @type {import("./types").APIModuleDTO} */
    const apiModuleDTO = {
      req,
      res,
      path,
      queries,
      sendCode,
      sendPayload
    };

    if (path[0] !== "api") return sendCode(404);

    return coreAPIModule(apiModuleDTO);
  });
}

if (process.env.NODE_ENV !== "test") createBackendServer().listen(80);
