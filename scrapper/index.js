/**
 * @module SCRAPPER
 * @see https://github.com/serguun42/mss/tree/scrapper
 * @description Parses schedule page, gets links to .xlsx-files, parses them then, builds table models for each and every possible study group, updates DB schedule for each group of those ones. If necessary, notifies via System Telegram channel.
 */
require("./scrapper.js");
