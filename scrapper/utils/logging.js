const fetch = require("node-fetch").default;

const IS_DEV = require("os").platform() === "win32" || process.argv[2] === "DEV";
const { LOGGING_HOST, LOGGING_PORT, LOGGING_TAG } = IS_DEV
  ? require("../../../DEV_CONFIGS/scrapper.config.json")
  : require("../scrapper.config.json");

/**
 * @param {(Error | string)[]} args
 * @returns {void}
 */
const Logging = (...args) => {
  if (IS_DEV) return console.log(...args);

  const payload = {
    isError: args.some((message) => message instanceof Error),
    args: args.map((arg) =>
      arg instanceof Error ? `${arg.name}\n${arg.message}${arg.stack ? `\n\n${arg.stack}` : ""}` : `${arg}`
    ),
    tag: LOGGING_TAG
  };

  fetch(`http://${LOGGING_HOST}:${LOGGING_PORT}`, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(new Date());
        console.warn(`Notifier response status code ${res.status} ${res.statusText}`);
        console.warn(text);
      }
    })
    .catch((e) => {
      console.warn(new Date());
      console.warn("Notifier logging error");
      console.warn(e);
    });
};

module.exports = IS_DEV ? console.log : Logging;
