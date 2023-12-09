import fetch from "node-fetch";
import ReadConfig from "./read-config.js";
import IS_DEV from "./is-dev.js";

const { LOGGING_HOST, LOGGING_PORT, LOGGING_TAG } = ReadConfig();

/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
export default function Logging(...args) {
  if (IS_DEV) return console.log(...args);

  const payload = {
    error: args.findIndex((message) => message instanceof Error) > -1,
    args: args.map((arg) => (arg instanceof Error ? { ERROR_name: arg.name, ERROR_message: arg.message } : arg)),
    tag: LOGGING_TAG
  };

  fetch(`http://${LOGGING_HOST}:${LOGGING_PORT}`, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then((res) => {
      if (res.status !== 200)
        return res.text().then((text) => {
          console.warn(new Date());
          console.warn(`Status code = ${res.status}`);
          console.warn(text);
        });
    })
    .catch((e) => {
      console.warn(new Date());
      console.warn(e);
    });
}
