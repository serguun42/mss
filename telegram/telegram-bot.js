const
	path = require("path"),
	cron = require("node-cron"),
	Telegraf = require("telegraf").Telegraf,
	Markup = require("telegraf").Markup;




const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	CONFIG = DEV ? require("../../DEV_CONFIGS/telegram-bot.config.json") : require("./telegram-bot.config.json"),
	{
		TELEGRAM_BOT_TOKEN,
		TELEGRAM_API_SERVER_PORT,
		DAYS_OF_WEEK,
		LABELS_FOR_TIMES_OF_DAY,
		CATS,
		DATABASE_NAME
	} = CONFIG;


const Logging = require("./utils/logging");
const MongoDispatcher = require("./utils/database");
const { Capitalize, Chunkify, GetCatImage, TGE } = require("./utils/common-utils");
const { GetScheduleByGroup, GetWeek, GetDay, BuildDay, BuildWeek, GetToday, GetTomorrow } = require("./utils/build-layout");
const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);




/**
 * @typedef {Object} User
 * @property {Number} id
 * @property {String} username
 * @property {String} group
 * @property {Boolean} [waitingForTextForSettings]
 * @property {Boolean} [waitingForGroupSelection]
 * @property {String} [selectingGroupName]
 * @property {Boolean} cats
 * @property {String} last_cat_photo
 * @property {Boolean} morning
 * @property {Boolean} evening
 * @property {Boolean} late_evening
 */
/** @type {User[]} */
const USERS = [];

mongoDispatcher.callDB() // Reading users
.then((DB) => DB.collection("telegram-users").find({}).toArray())
.then((usersFromDB) => {
	usersFromDB.forEach((user) => {
		/** @type {User} */ 
		const copiedUser = { ...user };

		delete copiedUser["waitingForGroupSelection"];
		delete copiedUser["waitingForTextForSettings"];
		delete copiedUser["selectingGroupName"];

		USERS.push(copiedUser);
	});
})
.catch((e) => Logging("Error on getting users", e));

const SESSION = ((new Date().getMonth() > 4 && new Date().getMonth() < 7) || (new Date().getMonth() === 7 && new Date().getDate() < 20));



/**
 * @param {import("telegraf").Context} ctx
 * @returns {Promise<User>}
 */
const GettingUserWrapper = (ctx) => new Promise((resolve, reject) => {
	const { chat, from } = ctx;

	const foundUser = USERS.find((user) => user.id === from.id);

	if (!foundUser) {
		PushIntoSendingImmediateQueue({
			text: "Произошла ошибка. Пожалуйста, выполните команду /start",
			destination: chat.id,
		});

		reject();
	} else {
		resolve(foundUser);
	};
});

/**
 * @callback ButtonCommandCaller
 * @param {import("telegraf").Context} ctx
 * @returns {void}
 */
/**
 * @type {{[commandName: string]: { description: String, caller: ButtonCommandCaller } | { description: String, text: String }}}
 */
const COMMANDS = {
	"today": {
		description: "Сегодня",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);


			const today = DAYS_OF_WEEK[GetDay() - 1];


			if (!today) {
				PushIntoSendingImmediateQueue({
					text: "Сегодня неучебный день!",
					destination: ctx.chat.id
				});
			} else {
				const todayLayout = await BuildDay(group, GetDay() - 1, GetWeek());

				if (todayLayout) {
					PushIntoSendingImmediateQueue({
						text: `Сегодня ${today}. Расписание:\n\n${todayLayout}`,
						destination: ctx.chat.id
					});
				} else {
					PushIntoSendingImmediateQueue({
						text: `Сегодня ${today}. Пар нет!`,
						destination: ctx.chat.id
					});
				};
			};
		}).catch(Logging)
	},
	"tomorrow": {
		description: "Завтра",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);


			const tomorrow = DAYS_OF_WEEK[GetDay()];


			if (!tomorrow) {
				PushIntoSendingImmediateQueue({
					text: "Завтра неучебный день!",
					destination: ctx.chat.id
				});
			} else {
				const tomorrowLayout = await BuildDay(group, GetDay(), GetWeek() + (GetDay() === 0));

				if (tomorrowLayout) {
					PushIntoSendingImmediateQueue({
						text: `Завтра ${tomorrow}. Расписание:\n\n${tomorrowLayout}`,
						destination: ctx.chat.id
					});
				} else {
					PushIntoSendingImmediateQueue({
						text: `Завтра ${tomorrow}. Пар нет!`,
						destination: ctx.chat.id
					});
				};
			};
		}).catch(Logging)
	},
	"weekthis": {
		description: "Текущая неделя",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);


			PushIntoSendingImmediateQueue({
				text: `Расписание на текущую неделю (№${GetWeek()}):\n\n${await BuildWeek(group, GetWeek())}`,
				destination: ctx.chat.id
			});
		}).catch(Logging)
	},
	"weeknext": {
		description: "Следующая неделя",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);


			PushIntoSendingImmediateQueue({
				text: `Расписание на следующую неделю (№${GetWeek() + 1}):\n\n${await BuildWeek(group, GetWeek() + 1)}`,
				destination: ctx.chat.id
			});
		}).catch(Logging)
	},
	"week3": {
		description: "Текущая неделя + 2",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);


			PushIntoSendingImmediateQueue({
				text: `Расписание на неделю №${GetWeek() + 2}:\n\n${await BuildWeek(group, GetWeek() + 2)}`,
				destination: ctx.chat.id
			});
		}).catch(Logging)
	},
	"week4": {
		description: "Текущая неделя + 3",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);


			PushIntoSendingImmediateQueue({
				text: `Расписание на неделю №${GetWeek() + 3}:\n\n${await BuildWeek(group, GetWeek() + 3)}`,
				destination: ctx.chat.id
			});
		}).catch(Logging)
	},
	"settings": {
		description: "⚙ Настройки",
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => {
			const { chat, from } = ctx;

			const foundUser = USERS.find((user) => user.id === from.id);

			if (!foundUser) return PushIntoSendingImmediateQueue({
				text: "Произошла ошибка. Пожалуйста, выполните команду /start",
				destination: chat.id,
			});

			foundUser.waitingForTextForSettings = true;


			PushIntoSendingImmediateQueue({
				text: `Вы можете настроить:

🔹 Название своей группы 🏭 (<i>да, это эмодзи завода</i>)

🔹 Присылать ли расписание на текущий день один раз утром в 7:00.
🔸🔸 <b>(только в те дни, когда есть пары)</b>

🔹 Присылать ли расписание на следующий день в 19:00.
🔸🔸 <b>(только на те дни, когда есть пары)</b>

🔹 Присылать ли расписание на следующий день в 22:00.
🔸🔸 <b>(только на те дни, когда есть пары)</b>

🔹 Присылать ли котиков 🐱 по утрам в дни вместе с расписанием, когда есть семинары или лабы.`,
				destination: chat.id,
				buttons: Markup.keyboard(
					SETTINGS_COMMANDS.map((settingCommand) =>
						[({text: settingCommand.text(foundUser)})]
					)
				).reply_markup
			});
		}
	},
	"map": {
		description: "🗺 Карта",
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => {
			PushIntoSendingImmediateQueue({
				text: "Карта МИРЭА по этажам",
				destination: ctx.chat.id,
				buttons: Markup.inlineKeyboard([
					{
						text: "🗺 Карта",
						url: "https://vk.com/album-144300510_243095650"
					}
				]).reply_markup
			});
		}
	},
	"help": {
		description: "❓ Помощь",
		text: `Я бот, который умеет делать многое с расписанием. Все группы уже доступны, но фича пока в beta-версии!

Мои доступные команды – в списке команд! (Кнопка «/» или «🎲» рядом с полем ввода)

Также я буду присылать тебе
🔹 расписание на текущий день один раз утром
🔸🔸 <b>(только в те дни, когда есть пары)</b>

🔹 расписание на следующий день два раза вечером
🔸🔸 <b>(только на те дни, когда есть пары)</b>

🔹 А ещё я могу отправлять котиков 🐱 по утрам в дни, когда есть семинары или лабы.

В общем, смотри настройки (/settings) и помощь (/help), если надо 🧐`
	},
	"table": {
		description: "📋 Файл расписания",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);

			PushIntoSendingImmediateQueue({
				text: `<a href="${encodeURI(group.remoteFile)}">${TGE(group.remoteFile)}</a>`,
				destination: ctx.chat.id,
				buttons: Markup.inlineKeyboard([
					{
						text: "XLSX файл с расписанием",
						url: encodeURI(group.remoteFile)
					}
				]).reply_markup
			});
		}).catch(Logging)
	}
};

/**
 * @callback SettingsCommandButtonTextSetter
 * @param {User} foundUser
 * @returns {String}
 */
/**
 * @type {{text: SettingsCommandButtonTextSetter, regexp: RegExp, caller: ButtonCommandCaller, groupSelection?: Boolean}[]}
 */
const SETTINGS_COMMANDS = [
	{
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `👈 Назад`,
		regexp: /👈 Назад/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then((foundUser) => {
			foundUser.waitingForTextForSettings = false;

			SaveUser(foundUser)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: "Настройки закрыты (и, естественно, применены ✅)",
					destination: ctx.chat.id,
				});
			}).catch(Logging);
		}).catch(Logging)
	},
	{
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `🕖 Рассылка утром – ${foundUser.morning ? "включена" : "выключена"}`,
		regexp: /🕖 Рассылка утром – в(ы)?ключена/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then((foundUser) => {
			foundUser.morning = !foundUser.morning;

			SaveUser(foundUser)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🕖 Рассылка утром – ${foundUser.morning ? "включена" : "выключена"}`,
					destination: ctx.chat.id,
					buttons: Markup.keyboard(
						SETTINGS_COMMANDS.map((settingCommand) =>
							[({text: settingCommand.text(foundUser)})]
						)
					).reply_markup
				});
			}).catch(Logging);
		}).catch(Logging)
	},
	{
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `🕖 Рассылка вечером – ${foundUser.evening ? "включена" : "выключена"}`,
		regexp: /🕖 Рассылка вечером – в(ы)?ключена/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then((foundUser) => {
			foundUser.evening = !foundUser.evening;

			SaveUser(foundUser)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🕖 Рассылка вечером – ${foundUser.evening ? "включена" : "выключена"}`,
					destination: ctx.chat.id,
					buttons: Markup.keyboard(
						SETTINGS_COMMANDS.map((settingCommand) =>
							[({text: settingCommand.text(foundUser)})]
						)
					).reply_markup
				});
			}).catch(Logging);
		}).catch(Logging)
	},
	{
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `🕙 Рассылка поздним вечером – ${foundUser.late_evening ? "включена" : "выключена"}`,
		regexp: /🕙 Рассылка поздним вечером – в(ы)?ключена/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then((foundUser) => {
			foundUser.late_evening = !foundUser.late_evening;

			SaveUser(foundUser)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🕖 Рассылка поздним вечером – ${foundUser.late_evening ? "включена" : "выключена"}`,
					destination: ctx.chat.id,
					buttons: Markup.keyboard(
						SETTINGS_COMMANDS.map((settingCommand) =>
							[({text: settingCommand.text(foundUser)})]
						)
					).reply_markup
				});
			}).catch(Logging);
		}).catch(Logging)
	},
	{
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `🐱 Котики – ${foundUser.cats ? "включены" : "выключены"}`,
		regexp: /🐱 Котики – в(ы)?ключены/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then((foundUser) => {
			foundUser.cats = !foundUser.cats;

			SaveUser(foundUser)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🐱 Котики – ${foundUser.cats ? "включены" : "выключены"}`,
					destination: ctx.chat.id,
					buttons: Markup.keyboard(
						SETTINGS_COMMANDS.map((settingCommand) =>
							[({text: settingCommand.text(foundUser)})]
						)
					).reply_markup
				});
			}).catch(Logging);
		}).catch(Logging)
	},
	{
		groupSelection: true,
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `🏭 Указать группу`,
		regexp: /🏭 Указать группу/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			if (foundUser.waitingForGroupSelection) {
				const text = ctx?.message?.text;

				const LocalReject = () => {
					PushIntoSendingImmediateQueue({
						text: `Такая группа не найдена попробуйте ещё раз.\n\nЕсли что-то пошло не так, вызовите команду /start ещё раз – выбор группы отменится.`,
						destination: ctx.chat.id,
						buttons: {
							hide_keyboard: true
						}
					});
				}

				if (!text) return LocalReject();


				const searchingQuery = foundUser.selectingGroupName ? {
					groupName: foundUser.selectingGroupName,
					groupSuffix: text
				} : { groupName: text };


				mongoDispatcher.callDB()
				.then((DB) => DB.collection("study-groups").find(searchingQuery).project({ groupName: 1, groupSuffix: 1, _id: 0 }).toArray())
				.then((foundGroups) => {
					if (!foundGroups.length) {
						LocalReject();
					} else if (foundGroups.length === 1) {
						delete foundUser.selectingGroupName;
						foundUser.waitingForGroupSelection = false;
						foundUser.waitingForTextForSettings = false;
						foundUser.group = foundGroups[0].groupSuffix ? `${foundGroups[0].groupName}&${foundGroups[0].groupSuffix}` : foundGroups[0].groupName;

						SaveUser(foundUser)
						.then(() => {
							PushIntoSendingImmediateQueue({
								text: `Ваша группа успешно установлена: <code>${TGE(foundUser.group.replace(/\&/g, ", "))}</code>`,
								destination: ctx.chat.id
							});
						}).catch(Logging);
					} else {
						foundUser.selectingGroupName = foundUser.selectingGroupName || text;
						
						SaveUser(foundUser)
						.then(() => {
							PushIntoSendingImmediateQueue({
								text: `Группу с названием ${TGE(foundUser.selectingGroupName)} надо уточнить. Просто отправьте мне один из следующих вариантов (скорее всего это название кафедры или направления):\n${foundGroups.map((group) => `<code>${TGE(group.groupSuffix)}</code>\n\nЕсли что-то пошло не так, вызовите команду /start ещё раз – выбор группы отменится.`).join("\n")}`,
								destination: ctx.chat.id,
								buttons: {
									hide_keyboard: true
								}
							});
						}).catch(Logging);
					}
				})
				.catch((e) => {
					LocalReject();
					Logging(e);
				});
			} else {
				foundUser.waitingForGroupSelection = true;

				PushIntoSendingImmediateQueue({
					text: `Давайте поменяем группу! Напишите её название точно. Если необходимо, надо будет уточнить группу (по названию кафедры).\n\nЕсли что-то пойдёт не так, вызовите команду /start ещё раз – выбор группы отменится.`,
					destination: ctx.chat.id,
					buttons: {
						hide_keyboard: true
					}
				});
			}
		}).catch(Logging)
	}
];

const COMMANDS_ALIASES = {};
Object.keys(COMMANDS).forEach((key) => {
	const alias = COMMANDS[key].description.replace(/[^\w\dа-я]+/gi, "");
	COMMANDS_ALIASES[alias] = COMMANDS[key];
});


/** @type {import("telegraf").Telegraf} */
const telegraf = new Telegraf(TELEGRAM_BOT_TOKEN, DEV ? {} : TELEGRAM_API_SERVER_PORT ? {
	telegram: {
		apiRoot: `http://127.0.0.1:${TELEGRAM_API_SERVER_PORT}`
	}
} : {});
const telegram = telegraf.telegram;




/**
 * @param {import("telegraf").Context} ctx 
 * @param {User} foundUser 
 */
const GroupNotFound = (ctx, foundUser) => {
	Logging(new Error(`No group for foundUser`), foundUser);

	PushIntoSendingImmediateQueue({
		text: `Ваша группа не найдена. Попробуйте задать её заново в настройках (команда /settings).`,
		destination: ctx.chat.id
	});
};

/**
 * @param {import("telegraf").Context} ctx 
 * @param {User} foundUser
 * @returns {Promise}
 */
const SaveUser = foundUser => {
	if (!foundUser.id) return Promise.reject(`No such user`);

	return new Promise((resolve, reject) => {
		mongoDispatcher.callDB()
		.then((DB) => DB.collection("telegram-users").findOneAndReplace({ id: foundUser.id }, foundUser))
		.then((updatingResult) => {
			if (updatingResult.ok)
				resolve();
			else
				reject(updatingResult);
		})
		.catch(reject);
	});
};

/**
 * @typedef {Object} SendingMessageType
 * @property {Number} destination
 * @property {String} text
 * @property {{text: string, callback_data: string, url: string}[][]} [buttons]
 * @property {String} [photo]
 */
/** @type {SendingMessageType[]} */
const IMMEDIATE_QUEUE = [];

/**
 * @param {SendingMessageType} messageData
 * @returns {Number}
 */
const PushIntoSendingImmediateQueue = (messageData) => IMMEDIATE_QUEUE.push(messageData);

/** @type {SendingMessageType[]} */
const MAILING_QUEUE = [];

/**
 * @param {SendingMessageType} messageData
 * @returns {Number}
 */
const PushIntoSendingMailingQueue = (messageData) => MAILING_QUEUE.push(messageData);

/**
 * @typedef {import("telegraf/typings/core/types/typegram").Message.PhotoMessage} PhotoMessage
 * @typedef {import("telegraf/typings/core/types/typegram").Message.TextMessage} TextMessage
 * @typedef {import("telegraf").TelegramError} TelegramError
 */
/**
 * @param {SendingMessageType} messageData
 * @returns {Promise<PhotoMessage | TextMessage>}
 */
const TelegramSend = (messageData) => {
	const replyKeyboard = Markup.keyboard(
		Chunkify(Object.keys(COMMANDS).map((key) => ({ text: COMMANDS[key].description })), 2)
	).resize(true).reply_markup;


	const sendingPromise = (messageData.photo ?
		telegram.sendPhoto(messageData.destination, {
			source: messageData.photo
		}, {
			caption: messageData.text,
			parse_mode: "HTML",
			disable_web_page_preview: true,
			reply_markup: messageData.buttons || replyKeyboard
		})
	:
		telegram.sendMessage(messageData.destination, messageData.text, {
			parse_mode: "HTML",
			disable_web_page_preview: true,
			reply_markup: messageData.buttons || replyKeyboard
		})
	);


	return sendingPromise.catch(/** @param {TelegramError} e */ (e) => {
		if (e && e.code === 403) {
			const foundUser = USERS.find((user) => user.id === messageData.destination);

			if (foundUser) {
				const indexOfFoundUser = USERS.findIndex((user) => user.id === messageData.destination);

				if (indexOfFoundUser) {
					USERS.splice(indexOfFoundUser, 1);

					mongoDispatcher.callDB()
					.then((DB) => DB.collection("telegram-users").findOneAndDelete({ id: messageData.destination }))
					.then((deletingResult) => {
						if (deletingResult.ok)
							Logging(`Successfully deleted user with id = ${messageData.destination}. They'd had index ${indexOfFoundUser} in users list but gone now.`, foundUser);
						else
							return Promise.reject(deletingResult);
					})
					.catch((e) => Logging(new Error("Error on deleting user from DB", e)));
				} else {
					Logging(new Error(`Could not deleting user with id ${messageData.destination} because of critical bug with finding proper user. Go see PushIntoSendingImmediateQueue() function.`));
				};
			} else {
				Logging(new Error(`Cannot remove user with id ${messageData.destination} because they're not in out users' list!`), e);
			};

			return Promise.resolve({});
		} else {
			return Promise.reject(e);
		};
	});
};

/**
 * @param {SendingMessageType} iMessageData 
 * @returns {void}
 */
const ImmediateSendingQueueProcedure = (iMessageData) => {
	const messageData = iMessageData || IMMEDIATE_QUEUE.shift();

	if (!(messageData && messageData.destination)) return;

	TelegramSend(messageData)
	.catch(/** @param {TelegramError} e */ (e) => {
		if (e && e.code === 429) {
			if (typeof e.parameters?.retry_after == "number")
				setTimeout(() => ImmediateSendingQueueProcedure(messageData), e.parameters?.retry_after * 1e3 + Math.random() * 2e3);
			else
				setTimeout(() => ImmediateSendingQueueProcedure(messageData), 2e3);
		} else {
			Logging(`Unknown error code`, e);
		}
	});
};

setInterval(ImmediateSendingQueueProcedure, 50);

/**
 * @param {SendingMessageType} iMessageData 
 * @returns {void}
 */
const MailingSendingQueueProcedure = (iMessageData) => {
	const messageData = iMessageData || MAILING_QUEUE.shift();

	if (!(messageData && messageData.destination)) return;

	TelegramSend(messageData)
	.catch(/** @param {TelegramError} e */ (e) => {
		if (e && e.code === 429) {
			if (typeof e.parameters?.retry_after == "number")
				setTimeout(() => MailingSendingQueueProcedure(messageData), e.parameters?.retry_after * 1e3 + Math.random() * 5e3);
			else
				setTimeout(() => MailingSendingQueueProcedure(messageData), 5e3);
		} else {
			Logging(`Unknown error code`, e);
		}
	});
};

setInterval(MailingSendingQueueProcedure, 2e3);





telegraf.start(/** @param {import("telegraf").Context} ctx */ (ctx) => {
	const foundUser = USERS.find((user) => user.id === ctx.chat.id);

	if (!foundUser) {
		const newUser = {
			id: ctx.chat.id,
			username: ctx.chat.username || ctx.chat.first_name,
			group: "",
			cats: true,
			last_cat_photo: "",
			morning: true,
			evening: true,
			late_evening: true,
			waitingForGroupSelection: true
		}

		USERS.push(newUser);

		mongoDispatcher.callDB()
		.then((DB) => DB.collection("telegram-users").insertOne(newUser))
		.catch(Logging);


		PushIntoSendingImmediateQueue({
			text: COMMANDS["help"].text,
			destination: ctx.chat.id,
			buttons: {
				hide_keyboard: true
			}
		});
	};

	if (foundUser?.group) {
		delete foundUser["selectingGroupName"];
		delete foundUser["waitingForGroupSelection"];
		delete foundUser["waitingForTextForSettings"];

		PushIntoSendingImmediateQueue({
			text: `Начали почти с нуля – ваши прежние настройки на месте.`,
			destination: ctx.chat.id
		});
	} else {
		PushIntoSendingImmediateQueue({
			text: `Выберите вашу учебную группу. Для этого точно напишите её название. Если необходимо, надо будет уточнить по названию кафедры или направлению (но я скажу, если надо).\n\nЕсли что-то пойдёт не так, вызовите команду /start ещё раз – выбор группы начнётся заново.`,
			destination: ctx.chat.id,
			buttons: {
				hide_keyboard: true
			}
		});
	}
});

telegraf.on("text", /** @param {import("telegraf").Context} ctx */ (ctx) => {
	const { chat, from } = ctx;


	if (chat) {
		const { message } = ctx;
		if (!message) return false;

		const { text } = message;
		if (!text) return false;


		ctx.deleteMessage(message.id).catch(() => {});


		const foundUser = USERS.find((user) => user.id === from.id);


		if (foundUser && foundUser.waitingForGroupSelection) {
			const settingsGroupCommandHandler = SETTINGS_COMMANDS.find((handler) => handler.groupSelection === true);

			if (settingsGroupCommandHandler)
				return settingsGroupCommandHandler.caller(ctx);
			else
				return PushIntoSendingImmediateQueue({
					text: "Не понял. Чего?!",
					destination: ctx.chat.id
				});
		}


		if (foundUser && foundUser.waitingForTextForSettings) {
			const settingsCommandHandler = SETTINGS_COMMANDS.find((handler) => handler.regexp.test(text));

			if (settingsCommandHandler)
				return settingsCommandHandler.caller(ctx);
			else
				return PushIntoSendingImmediateQueue({
					text: "Не понял. Чего?!",
					destination: ctx.chat.id
				});
		}


		const commandAlias = Capitalize(text.replace(/[^\w\dа-я]+/gi, "").trim());

		if (COMMANDS_ALIASES[commandAlias]) {
			if (typeof COMMANDS_ALIASES[commandAlias].caller == "function")
				return COMMANDS_ALIASES[commandAlias].caller(ctx);
			else if (typeof COMMANDS_ALIASES[commandAlias].text == "string")
				return PushIntoSendingImmediateQueue({
					text: COMMANDS_ALIASES[commandAlias].text,
					destination: ctx.chat.id
				});
		};


		const commandMatch = text.match(/^\/([\w\d]+)(\@mirea_table_bot)?$/i);

		if (commandMatch && commandMatch[1]) {
			if (COMMANDS[commandMatch[1]]) {
				if (typeof COMMANDS[commandMatch[1]].caller == "function")
					return COMMANDS[commandMatch[1]].caller(ctx);
				else if (typeof COMMANDS[commandMatch[1]].text == "string")
					return PushIntoSendingImmediateQueue({
						text: COMMANDS[commandMatch[1]].text,
						destination: ctx.chat.id
					});
			};
		};

		return PushIntoSendingImmediateQueue({
			text: "Не понял. Чего?!",
			destination: ctx.chat.id
		});
	};
});

telegraf.launch();





/**
 * @param {"morning" | "evening" | "late_evening"} timeOfDay 
 * @param {import("./utils/build-layout").GettingDayLayout} layoutFunc
 */
const GlobalSendToAllUsers = (timeOfDay, layoutFunc) => {
	USERS.forEach(async (user) => {
		if (!user[timeOfDay]) return;

		const day = await layoutFunc(user.group);

		if (!day) return;


		/**
		 * Deletes various `waiting…` props from users on usual sending schedule.
		 * Users with unset group still will be asked for choosing one.
		 */
		const LocalDeleteWaitingStates = () => {
			delete user["waitingForGroupSelection"];
			delete user["waitingForTextForSettings"];
			delete user["selectingGroupName"];
		};

		const LocalSendDefault = () => {
			LocalDeleteWaitingStates();

			PushIntoSendingMailingQueue({
				text: `${LABELS_FOR_TIMES_OF_DAY[timeOfDay]} ${day.nameOfDay}. Расписание:\n\n${day.layout}`,
				destination: user.id
			});
		};


		if (timeOfDay === "morning" && user.cats && CATS.ENABLED) {
			const practices = day.layout.match(/\((пр)\)/i)?.[1],
				  labs = day.layout.match(/\((лаб)\)/i)?.[1];

			if (practices || labs) {
				GetCatImage(user.last_cat_photo)
				.then((catImageToSend) => {
					user.last_cat_photo = catImageToSend;

					LocalDeleteWaitingStates();

					SaveUser(user).catch((e) => Logging(new Error("Error on saving after cats send on morning"), e));

					PushIntoSendingMailingQueue({
						text: `${LABELS_FOR_TIMES_OF_DAY[timeOfDay]} ${day.nameOfDay} и сегодня есть ${labs ? "лабы" : "семинары"}! Расписание:\n\n${day.layout}`,
						destination: user.id,
						photo: path.join(CATS.FOLDER, catImageToSend)
					});
				}).catch((e) => {
					Logging(`Cats sending failed`, e);

					LocalSendDefault();
				});
			} else
				LocalSendDefault();
		} else
			LocalSendDefault();
	});
};

if (!DEV & !SESSION) {
	cron.schedule("0 4 * * *", () => GlobalSendToAllUsers("morning", GetToday));
	cron.schedule("0 16 * * *", () => GlobalSendToAllUsers("evening", GetTomorrow));
	cron.schedule("0 19 * * *", () => GlobalSendToAllUsers("late_evening", GetTomorrow));
};

if (DEV) {
	process.on("unhandledRejection", (reason, p) => {
		Logging("Unhandled Rejection at: Promise", p, "reason:", reason);
	});
};
