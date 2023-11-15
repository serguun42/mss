const fetch = require("node-fetch").default;

const DEV = require("os").platform() === "win32" || process.argv[2] === "DEV";
const { LOGGING_HOST, LOGGING_PORT, LOGGING_TAG } = DEV
  ? require("../../../DEV_CONFIGS/scrapper.config.json")
  : require("../scrapper.config.json");

/**
 * @param {(Error | string)[]} args
 * @returns {void}
 */
const Logging = (...args) => {
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
};

module.exports = DEV ? console.log : Logging;
