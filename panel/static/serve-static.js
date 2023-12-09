import { readFile } from "node:fs/promises";

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse<import('http').IncomingMessage>} res
 */
export default function ServeStatic(req, res) {
  const SendError = () => {
    res.status = 404;
    res.setHeader("Content-Type", "text/plain; charset=UTF-8");
    res.end("404 Not Found");
  };

  const STATIC_FILES_MIME_TYPES = {
    "./static/favicon.ico": "image/x-icon",
    "./static/index.html": "text/html; charset=UTF-8",
    "./static/Roboto-Medium.ttf": "font/ttf"
  };

  /** @type {keyof typeof STATIC_FILES_MIME_TYPES} */
  const readingFile =
    req.url === "/favicon.ico"
      ? "./static/favicon.ico"
      : req.url === "/Roboto-Medium.ttf"
      ? "./static/Roboto-Medium.ttf"
      : "./static/index.html";

  readFile(readingFile)
    .then((fileBuffer) => {
      res.statusCode = 200;
      res.setHeader("Content-Length", fileBuffer.length);
      res.setHeader("Content-Type", STATIC_FILES_MIME_TYPES[readingFile]);
      res.end(fileBuffer);
    })
    .catch(SendError);
}
