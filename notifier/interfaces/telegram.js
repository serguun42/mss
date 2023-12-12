import { Telegraf } from "telegraf";
import readConfig from "../util/read-config.js";
import LogToConsole from "./console.js";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_API_SERVER_HOST, TELEGRAM_API_SERVER_PORT, TELEGRAM_SYSTEM_CHANNEL } =
  readConfig();

const telegraf = new Telegraf(
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_API_SERVER_HOST && TELEGRAM_API_SERVER_PORT
    ? {
        telegram: {
          apiRoot: `http://${TELEGRAM_API_SERVER_HOST}:${TELEGRAM_API_SERVER_PORT}`
        }
      }
    : {}
);
const { telegram } = telegraf;
if (TELEGRAM_BOT_TOKEN) telegraf.launch();

/**
 * @param {string} sending
 * @returns {string}
 */
const telegramPrepareSendingString = (sending) => {
  if (!sending) return "";
  if (typeof sending !== "string") return telegramPrepareSendingString(`${sending}`);

  return sending
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

/**
 * @param {string} text
 * @param {number} [maxLength]
 * @returns {string}
 */
const trimLongText = (text, maxLength = 2000) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}… (TRIMMED)` : text;

/** @type {string[]} */
const SENDING_QUEUE = [];

/** @type {import('../types').LoggingInterface} */
export default function LogToTelegram(payload) {
  if (!telegram || !TELEGRAM_SYSTEM_CHANNEL) return;

  const messageArgsLayout = payload.args
    .map(
      /** @return {{ argAsText: string; isJSON?: boolean }} */ (arg) => {
        if (typeof arg === "string") return { argAsText: arg };

        try {
          const json = JSON.stringify(arg, null, 2);
          return { argAsText: json, isJSON: true };
        } catch (_) {
          return { argAsText: `${arg}` };
        }
      }
    )
    .map(
      (message) =>
        `<pre${message.isJSON ? ' language="json"' : ""}>${telegramPrepareSendingString(
          trimLongText(message.argAsText)
        )}</pre>`
    )
    .join("\n");

  const messageTagsLayout = [telegramPrepareSendingString(trimLongText(payload.tag))]
    .concat(payload.isError ? "error" : "logs")
    .filter(Boolean)
    .map((tag) => `#${tag}`)
    .join(" ");

  const completeMessageLayout = `${messageArgsLayout}\n\n${messageTagsLayout}`;

  SENDING_QUEUE.push(completeMessageLayout);
}

/** @param {string} textMessage */
const sendMessageToChannel = (textMessage) => {
  if (!TELEGRAM_SYSTEM_CHANNEL) return Promise.reject(new Error("Cannot send message to non-existent channel"));

  return telegram.sendMessage(TELEGRAM_SYSTEM_CHANNEL, textMessage, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
};

const SENDING_INTERVAL_MS = 250;
/** @param {string} givenTextMessage */
const sendNextMessageProcedure = (givenTextMessage) => {
  const sendingText = givenTextMessage || SENDING_QUEUE.shift();

  if (!sendingText) {
    setTimeout(sendNextMessageProcedure, SENDING_INTERVAL_MS * 2);
    return;
  }

  sendMessageToChannel(sendingText)
    .then(() => {
      setTimeout(sendNextMessageProcedure, SENDING_INTERVAL_MS);
    })
    .catch(
      /** @param {import("telegraf").TelegramError} e */ (e) => {
        if (e?.code === 429 || e?.response?.error_code === 429) {
          const waitingTime =
            (e.response.parameters?.retry_after || e.parameters?.retry_after || 1) * 1000 + SENDING_INTERVAL_MS * 2;

          setTimeout(() => sendNextMessageProcedure(sendingText), waitingTime);
          return;
        }

        LogToConsole({
          isError: true,
          args: ["Cannot send message to Telegram:", e instanceof Error ? `${e.name}\n${e.message}` : `${e}`],
          tag: "notifier"
        });

        setTimeout(sendNextMessageProcedure, SENDING_INTERVAL_MS);
      }
    );
};

sendNextMessageProcedure();
