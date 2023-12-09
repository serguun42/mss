/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Buffer>}
 */
export default function ReadPayload(req) {
  return new Promise((resolve, reject) => {
    /** @type {Buffer[]} */
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));

    req.on("error", (e) => reject(e));

    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
