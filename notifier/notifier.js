const http = require("http");
/**
 * @param {{[code: string]: string}} iStatusCodes
 * @returns {{[code: number]: string}}
 */
const GetStatusCodes = (iStatusCodes) => {
  const newCodes = {};

  Object.keys(iStatusCodes).forEach((code) => (newCodes[code] = `${code} ${iStatusCodes[code]}`));

  return newCodes;
};
const STATUSES = GetStatusCodes(http.STATUS_CODES);

const { Telegraf } = require("telegraf");

const DEV = require("os").platform() === "win32" || process.argv[2] === "DEV";
const { TELEGRAM_BOT_TOKEN, TELEGRAM_API_SERVER_HOST, TELEGRAM_API_SERVER_PORT, TELEGRAM_SYSTEM_CHANNEL } = DEV
  ? require("../../DEV_CONFIGS/notifier-and-logger.config.json")
  : require("./notifier-and-logger.config.json");

const telegraf = new Telegraf(
  TELEGRAM_BOT_TOKEN,
  !DEV && TELEGRAM_API_SERVER_HOST && TELEGRAM_API_SERVER_PORT
    ? {
        telegram: {
          apiRoot: `http://${TELEGRAM_API_SERVER_HOST}:${TELEGRAM_API_SERVER_PORT}`
        }
      }
    : {}
);
const { telegram } = telegraf;

/**
 * @param {String} iQuery
 * @returns {{[queryName: string]: string | true}}
 */
const GlobalParseQuery = (iQuery) => {
  if (!iQuery) return {};

  const returningList = {};

  iQuery
    .toString()
    .replace(/^\?/, "")
    .split("&")
    .forEach((queryPair) => {
      try {
        if (queryPair.split("=")[1])
          returningList[queryPair.split("=")[0]] = decodeURIComponent(queryPair.split("=")[1]);
        else returningList[queryPair.split("=")[0]] = true;
      } catch (e) {
        returningList[queryPair.split("=")[0]] = queryPair.split("=")[1] || true;
      }
    });

  return returningList;
};

/**
 * @typedef {Object} NotifierRegularPayload
 * @property {Boolean} error
 * @property {String[]} args
 * @property {String} tag
 *
 * @typedef {NotifierRegularPayload | String} NotifierPayloadType
 */
/**
 * @param {NotifierPayloadType | Error} payload
 * @returns {void}
 */
const LogViaConsole = (payload) => {
  if (payload instanceof Error) {
    console.error(new Date());
    console.error(payload);
    console.error("~~~~~~~~~~~\n");
  } else if (typeof payload === "string") {
    const out = /error/gi.test(payload) ? console.error : console.log;

    out(new Date());
    out(payload);
    out("~~~~~~~~~~~\n");
  } else {
    const out = payload.error ? console.error : console.log;

    out(new Date());

    if (payload.tag) out(`Tag: #${payload.tag}`);

    if (payload.args && payload.args instanceof Array) payload.args.forEach((message) => out(message));
    else out(payload);

    out("~~~~~~~~~~~\n");
  }
};

/**
 * @param {String} iStringToEscape
 * @returns {String}
 */
const TGE = (iStringToEscape) => {
  if (!iStringToEscape) return "";

  if (typeof iStringToEscape === "string")
    return iStringToEscape.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
  else return TGE(iStringToEscape.toString());
};

/**
 * @param {String} iStringToUnescape
 * @returns {String}
 */
const TGUE = (iStringToUnescape) => {
  if (!iStringToUnescape) return "";

  if (typeof iStringToUnescape === "string")
    return iStringToUnescape
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  else return TGUE(iStringToUnescape.toString());
};

/**
 * @param {NotifierPayloadType} payload
 * @returns {void}
 */
const LogViaTelegram = (payload) => {
  if (!telegram || !TELEGRAM_SYSTEM_CHANNEL) return;

  /**
   * @param {String} iMessage
   * @returns {String}
   */
  const LocalTrimAndMarkIfNeeded = (iMessage) =>
    iMessage.length > 4000 ? iMessage.slice(0, 3500) + "\n… (message too long)" : iMessage;

  new Promise((resolve) => {
    if (typeof payload === "string") {
      resolve(
        `${TGE(LocalTrimAndMarkIfNeeded(payload.toString()))}\n\n${
          /error/gi.test(payload) ? "#error" : "#logs"
        } #unknown`
      );
    } else {
      const stringifiedPayload =
        payload.args && payload.args instanceof Array
          ? payload.args.length === 1
            ? `<pre>${TGE(
                LocalTrimAndMarkIfNeeded(
                  typeof payload.args[0] === "string" ? payload.args[0] : JSON.stringify(payload.args[0], false, "  ")
                )
              )}</pre>`
            : `<pre>${TGE(LocalTrimAndMarkIfNeeded(JSON.stringify(payload.args, false, "  ")))}</pre>`
          : `<pre>${TGE(LocalTrimAndMarkIfNeeded(JSON.stringify(payload, false, "  ")))}</pre>`;

      resolve(
        `${stringifiedPayload}\n\n${[payload.tag]
          .concat(payload.error ? "error" : "logs")
          .filter((tag) => !!tag)
          .map((tag) => `#${tag}`)
          .join(" ")}`
      );
    }
  })
    .then(
      /** @param {String} messageToSend */ (messageToSend) => {
        PushIntoSendingQueue({
          destination: TELEGRAM_SYSTEM_CHANNEL,
          text: messageToSend
        });
      }
    )
    .catch((e) => {
      LogViaConsole({
        error: true,
        args: ["On LogViaTelegram promise catch handler.", "Reason", e],
        tag: "notifieritself"
      });
    });
};

/**
 * @typedef {Object} SendingMessageType
 * @property {Number} destination
 * @property {String} text
 */
/** @type {SendingMessageType[]} */
const SENDING_QUEUE = [];

/**
 * @param {SendingMessageType} messageData
 * @returns {Number}
 */
const PushIntoSendingQueue = (messageData) => SENDING_QUEUE.push(messageData);

/**
 * @typedef {import("telegraf/typings/core/types/typegram").Message.TextMessage} TextMessage
 * @typedef {import("telegraf").TelegramError} TelegramError
 */
/**
 * @param {SendingMessageType} messageData
 * @returns {Promise<TextMessage>}
 */
const TelegramSend = (messageData) => {
  return telegram.sendMessage(messageData.destination, messageData.text, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
};

/**
 * @param {SendingMessageType} iMessageData
 * @returns {void}
 */
const SendingQueueProcedure = (iMessageData) => {
  const messageData = iMessageData || SENDING_QUEUE.shift();

  if (messageData && messageData.destination) {
    TelegramSend(messageData)
      .then(() => setTimeout(SendingQueueProcedure, 50))
      .catch(
        /** @param {TelegramError} e */ (e) => {
          if (e && e.code === 429) {
            if (typeof e.parameters?.retry_after == "number")
              setTimeout(() => SendingQueueProcedure(messageData), e.parameters?.retry_after * 1e3);
            else setTimeout(() => SendingQueueProcedure(messageData), 1e3);
          } else {
            LogViaConsole({
              error: true,
              args: ["On TelegramSend @ SendingQueueProcedure promise catch handler.", "Reason", e],
              tag: "notifieritself"
            });

            setTimeout(SendingQueueProcedure, 50);
          }
        }
      );
  } else setTimeout(SendingQueueProcedure, 50);
};

SendingQueueProcedure();

/**
 * @param {NotifierPayloadType} payload
 * @returns {void}
 */
const GenericLog = (payload) => {
  if (typeof payload === "string") {
    if (/error/gi.test(payload) || DEV) LogViaConsole(payload);

    if (!DEV) LogViaTelegram(payload);
  } else {
    if (payload?.error || DEV) LogViaConsole(payload);

    if (!DEV) LogViaTelegram(payload);
  }
};

if (TELEGRAM_BOT_TOKEN) telegraf.launch();

const server = http.createServer((req, res) => {
  /**
   * @param {Number} iCode
   * @param {String | Buffer | Object} iData
   * @returns {false}
   */
  const GlobalSendCustom = (iCode, iData) => {
    res.statusCode = iCode;

    if (typeof iData === "object") {
      res.setHeader("Content-Type", "application/json; charset=UTF-8");
      res.end(JSON.stringify(iData));
    } else {
      res.end(iData.toString());
    }

    return false;
  };

  /**
   * @param {Number} iCode
   * @returns {false}
   */
  const GlobalSend = (iCode) => {
    res.statusCode = iCode || 200;
    res.end(STATUSES[iCode || 200]);
    return false;
  };

  if (req.method === "POST") {
    new Promise((resolve, reject) => {
      const chunks = [];

      req.on("data", (chunk) => chunks.push(chunk));

      req.on("error", (e) => reject(e));

      req.on("end", () => resolve(Buffer.concat(chunks)));
    })
      .then(
        /** @param {Buffer} iRequestBuffer */ (iRequestBuffer) => {
          const payloadString = iRequestBuffer.toString();

          try {
            const payloadParsed = JSON.parse(payloadString);

            GenericLog(payloadParsed);
          } catch (e) {
            GenericLog(payloadString);
          }

          GlobalSendCustom(200, { wrote: true });
        }
      )
      .catch((e) => {
        LogViaConsole({
          error: true,
          args: ["On POST-method promise catch handler.", "Reason", e],
          tag: "notifieritself"
        });

        GlobalSend(500);
      });
  } else {
    const queries = GlobalParseQuery(new URL(req.url, "https://mirea.xyz").search);

    const error = !!queries["error"],
      args = queries["args"] || queries["message"] || queries["messages"],
      tag = queries["tag"];

    try {
      const parsedArgs = JSON.parse(args);

      GenericLog({
        error,
        args: parsedArgs instanceof Array ? parsedArgs : [parsedArgs],
        tag: tag || "unknown"
      });
    } catch (e) {
      GenericLog({
        error,
        args: [args],
        tag: tag || "unknown"
      });
    }

    GlobalSendCustom(200, { wrote: true });
  }
});

server.listen(80);

process.on("unhandledRejection", (reason, p) => {
  LogViaConsole({
    error: true,
    args: ["Unhandled Rejection", p, reason],
    tag: "notifieritself"
  });
});
