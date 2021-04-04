const 
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	Telegraf = require("telegraf");

const
	CONFIG = DEV ? require("../../../DEV_CONFIGS/telegram-bot.config.json") : require("../telegram-bot.config.json"),
	{ 
		TELEGRAM_BOT_TOKEN
	} = CONFIG;



const telegraf = new Telegraf.Telegraf(TELEGRAM_BOT_TOKEN);
const telegram = telegraf.telegram;



telegram.close()
	.then((success) => console.log(`Close success: ${success}`))
	.catch(console.warn);
