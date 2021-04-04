const Telegraf = require("telegraf").Telegraf;
const Markup = require("telegraf").Markup;

const
	CONFIG = DEV ? require("../../../DEV_CONFIGS/telegram-bot.config.json") : require("../telegram-bot.config.json"),
	{
		TELEGRAM_BOT_TOKEN
	} = CONFIG;

const telegraf = new Telegraf(TELEGRAM_BOT_TOKEN);
const telegram = telegraf.telegram;

const COMMANDS_TEXT = [
	"Сегодня",
	"Завтра",
	"Текущая неделя",
	"Следующая неделя",
	"Текущая неделя + 2",
	"Текущая неделя + 3",
	"⚙ Настройки",
	"🗺 Карта",
	"❓ Помощь",
	"📋 Файл расписания"
]



/**
 * @param {Array} iArray
 * @param {Number} iChunkSize
 * @returns {Array.<Array>}
 */
const Chunkify = (iArray, iChunkSize) => {
	if (!iArray || !iChunkSize) return iArray;

	const outArray = [];

	iArray.forEach((elem, index) => {
		let pasteIndex = Math.floor(index / iChunkSize);
		if (!outArray[pasteIndex]) outArray.push([]);
		outArray[pasteIndex].push(elem);
	});

	return outArray;
};

/**
 * @param {{ destination: Number, text: String }} messageData
 * @returns {void}
 */
const TelegramSend = (messageData) => {
	const replyKeyboard = Markup.keyboard(
		Chunkify(COMMANDS_TEXT.map((text) => ({ text })), 2)
	).resize(true).reply_markup;


	telegram.sendMessage(messageData.destination, messageData.text, {
		parse_mode: "HTML",
		disable_web_page_preview: true,
		reply_markup: replyKeyboard
	}).catch(console.warn);
};



const textToSend = ``;






USERS.forEach((user) => {
	TelegramSend({
		destination: user.id,
		text: textToSend
	})
});
