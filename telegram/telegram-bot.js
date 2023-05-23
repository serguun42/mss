const
	{ createReadStream } = require("fs"),
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
		DATABASE_NAME
	} = CONFIG;


const Logging = require("./utils/logging");
const MongoDispatcher = require("./utils/database");
const { Capitalize, Chunkify, TGE } = require("./utils/common-utils");
const { GetScheduleByGroup, GetWeek, GetDay, BuildDay, BuildWeek, GetToday, GetTomorrow } = require("./utils/build-layout");
const GetChat = require("./utils/get-chat");
const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);




/**
 * @typedef {object} User
 * @property {number} id
 * @property {number} [thread]
 * @property {string} username
 * @property {string} group
 * @property {boolean} [waitingForTextForSettings]
 * @property {boolean} [waitingForGroupSelection]
 * @property {string} [selectingGroupName]
 * @property {boolean} morning
 * @property {boolean} evening
 * @property {boolean} late_evening
 */
/** @type {User[]} */
const USERS = [];

mongoDispatcher.callDB() // Reading users
.then((DB) => DB.collection("telegram_users").find({}).toArray())
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

/**
 * @returns {boolean}
 */
const IsSession = () => (
	(new Date().getMonth() > 4 && new Date().getMonth() < 7) ||
	(new Date().getMonth() === 7 && new Date().getDate() < 31) ||
	(new Date().getMonth() === 11 && new Date().getDate() >= 22) ||
	(new Date().getMonth() === 0) ||
	(new Date().getMonth() === 1 && new Date().getDate() < 7) ||
	(new Date().getMonth() === 4 && new Date().getDate() >= 31)
);



/**
 * @param {import("./utils/get-chat").DefaultContext} ctx
 * @returns {Promise<User>}
 */
const GettingUserWrapper = (ctx) => new Promise((resolve, reject) => {
	const foundUser = USERS.find((user) => user.id === GetChat(ctx).id);

	if (!foundUser) {
		PushIntoSendingImmediateQueue({
			text: "Произошла ошибка. Пожалуйста, выполните команду /start",
			destination: GetChat(ctx),
		});

		reject(new Error(`User not found – ${JSON.stringify(GetChat(ctx))}`));
	} else {
		resolve(foundUser);
	}
});

/**
 * @callback ButtonCommandCaller
 * @param {import("./utils/get-chat").DefaultContext} ctx
 * @returns {void}
 */
/**
 * @type {{[commandName: string]: { description: string, caller: ButtonCommandCaller } | { description: string, text: string }}}
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
					destination: GetChat(ctx)
				});
			} else {
				const todayLayout = await BuildDay(group, GetDay() - 1, GetWeek());

				if (todayLayout) {
					PushIntoSendingImmediateQueue({
						text: `Сегодня ${today}. Расписание:\n\n${todayLayout}`,
						destination: GetChat(ctx)
					});
				} else {
					PushIntoSendingImmediateQueue({
						text: `Сегодня ${today}. Пар нет!`,
						destination: GetChat(ctx)
					});
				}
			}
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
					destination: GetChat(ctx)
				});
			} else {
				const tomorrowLayout = await BuildDay(group, GetDay(), GetWeek() + (GetDay() === 0));

				if (tomorrowLayout) {
					PushIntoSendingImmediateQueue({
						text: `Завтра ${tomorrow}. Расписание:\n\n${tomorrowLayout}`,
						destination: GetChat(ctx)
					});
				} else {
					PushIntoSendingImmediateQueue({
						text: `Завтра ${tomorrow}. Пар нет!`,
						destination: GetChat(ctx)
					});
				}
			}
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
				destination: GetChat(ctx)
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
				destination: GetChat(ctx)
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
				destination: GetChat(ctx)
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
				destination: GetChat(ctx)
			});
		}).catch(Logging)
	},
	"settings": {
		description: "⚙ Настройки",
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => {
			const foundUser = USERS.find((user) => user.id === GetChat(ctx).id);

			if (!foundUser) return PushIntoSendingImmediateQueue({
				text: "Произошла ошибка. Пожалуйста, выполните команду /start",
				destination: GetChat(ctx),
			});

			foundUser.waitingForTextForSettings = true;


			PushIntoSendingImmediateQueue({
				text: `Ты можешь настроить:

🔹 Название своей группы 🏭

🔹 Присылать ли расписание на текущий день один раз утром в 7:00.
🔸🔸 <b>(только в те дни, когда есть пары)</b>

🔹 Присылать ли расписание на следующий день в 19:00.
🔸🔸 <b>(только на те дни, когда есть пары)</b>

🔹 Присылать ли расписание на следующий день в 22:00.
🔸🔸 <b>(только на те дни, когда есть пары)</b>`,
				destination: GetChat(ctx),
				buttons: Markup.keyboard(
					SETTINGS_COMMANDS.map((settingCommand) =>
						[({text: settingCommand.text(foundUser)})]
					)
				).reply_markup
			});
		}
	},
	"map": {
		description: "🗺 Схема",
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => {
			PushIntoSendingImmediateQueue({
				text: "Интерактивная карта/схема с поиском по аудиториям",
				destination: GetChat(ctx),
				buttons: Markup.inlineKeyboard([
					{
						text: "🗺 Схема вуза",
						url: "https://mirea.xyz/scheme"
					}
				]).reply_markup
			});
		}
	},
	"help": {
		description: "❓ Помощь",
		text: `Я бот с расписанием МИРЭА. Я умею показывать пары твоей группы по дням и неделям и рассылать расписание на дни, когда есть пары.

Больше информации о рассылке – в настройках (/settings). Все доступные команды – кнопки «☰» или «🎲» рядом с полем ввода.

Как добавить бота в групповые чаты – /aboutgroups`
	},
	"table": {
		description: "📋 Файл расписания",
		/** @type {ButtonCommandCaller} */
		caller: (ctx) => GettingUserWrapper(ctx).then(async (foundUser) => {
			const group = await GetScheduleByGroup(foundUser.group);
			if (!group) return GroupNotFound(ctx, foundUser);

			PushIntoSendingImmediateQueue({
				text: `<a href="${encodeURI(group.remoteFile)}">${TGE(group.remoteFile)}</a>`,
				destination: GetChat(ctx),
				buttons: Markup.inlineKeyboard([
					{
						text: "Оригинальный XLSX-файл",
						url: encodeURI(group.remoteFile)
					}
				]).reply_markup
			});
		}).catch(Logging)
	},
	"aboutgroups": {
		description: "👬 Помощь c групповыми чатами",
		text: `Бот доступен для работы в группах. Вот как можно его активировать и настроить:

1. Добавьте бота в группу – @mirea_table_bot
2. Напишите в группе команду <code>/start@mirea_table_bot</code>
3. На отправленное ботом сообщение ответьте номером группы, которую хотите прикрепить (позже её можно поменять)
4. После установки группы вы сможете настроить рассылку (или отключить её).
5. Если вы добавляете бота в группу с тредами (топиками, форумами), то при включённой рассылке бот будет отправлять её в тот тред, где была впервые вызвана команда <code>/start</code>, или в тред, где настройки были изменены в последний раз.

<b>Важно</b>: все взаимодействия с ботом в группе совершайте через кнопки (под полем ввода) или отвечая на сообщения бота. У бота активирован <a href="https://core.telegram.org/bots/features#privacy-mode">режим приватности</a> – т.е. ему доступны только те сообщения, что отправлены через его же кнопки, или реплаи ему. По этой же причине выдача админских прав боту не рекомендуется.`
	}
};

/**
 * @callback SettingsCommandButtonTextSetter
 * @param {User} foundUser
 * @returns {string}
 */
/**
 * @type {{text: SettingsCommandButtonTextSetter, regexp: RegExp, caller: ButtonCommandCaller, groupSelection?: boolean}[]}
 */
const SETTINGS_COMMANDS = [
	{
		/** @type {SettingsCommandButtonTextSetter} */
		text: (foundUser) => `👈 Назад`,
		regexp: /👈 Назад/i,
		/** @type {ButtonCommandCaller} */
		caller: async (ctx) => GettingUserWrapper(ctx).then((foundUser) => {
			foundUser.waitingForTextForSettings = false;

			SaveUser(foundUser, ctx)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: "Настройки закрыты (и, естественно, применены ✅)",
					destination: GetChat(ctx),
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

			SaveUser(foundUser, ctx)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🕖 Рассылка утром – ${foundUser.morning ? "включена" : "выключена"}`,
					destination: GetChat(ctx),
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

			SaveUser(foundUser, ctx)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🕖 Рассылка вечером – ${foundUser.evening ? "включена" : "выключена"}`,
					destination: GetChat(ctx),
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

			SaveUser(foundUser, ctx)
			.then(() => {
				PushIntoSendingImmediateQueue({
					text: `🕖 Рассылка поздним вечером – ${foundUser.late_evening ? "включена" : "выключена"}`,
					destination: GetChat(ctx),
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
				/** @type {string} */
				const plainGroupNameOrSuffix = (ctx?.message?.text || "");
				/** @type {string} */
				const filteredGroupNameOrSuffix = plainGroupNameOrSuffix.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");

				const LocalReject = () => {
					PushIntoSendingImmediateQueue({
						text: `Такая группа не найдена попробуйте ещё раз.\n\nЕсли что-то пошло не так, вызовите команду /start ещё раз – выбор группы отменится.`,
						destination: GetChat(ctx),
						buttons: {
							hide_keyboard: true
						}
					});
				};

				if (!filteredGroupNameOrSuffix) return LocalReject();
				const regexpGroupNameOrSuffix = new RegExp(filteredGroupNameOrSuffix, "i");


				const searchingQuery = foundUser.selectingGroupName ? {
					groupName: foundUser.selectingGroupName,
					groupSuffix: regexpGroupNameOrSuffix
				} : { groupName: regexpGroupNameOrSuffix };


				mongoDispatcher.callDB()
				.then((DB) =>
					DB.collection("study_groups")
					.find(searchingQuery)
					.project({ groupName: 1, groupSuffix: 1, _id: 0 })
					.toArray()
				)
				.then(/** @param {} foundGroups */ (foundGroups) => {
					foundGroups = foundGroups.filter((group, index, array) =>
						array.findIndex((matchingGroup) =>
							`${matchingGroup.groupName}&${matchingGroup.groupSuffix || ""}` ===
							`${group.groupName}&${group.groupSuffix || ""}`
						) === index
					);

					if (!foundGroups.length) {
						LocalReject();
					} else if (foundGroups.length === 1) {
						delete foundUser.selectingGroupName;
						foundUser.waitingForGroupSelection = false;
						foundUser.waitingForTextForSettings = false;
						foundUser.group = `${foundGroups[0].groupName}&${foundGroups[0].groupSuffix || ""}`;

						SaveUser(foundUser, ctx)
						.then(() => {
							PushIntoSendingImmediateQueue({
								text: `Ваша группа успешно установлена: <code>${TGE(foundUser.group.replace(/\&/g, ", "))}</code>`,
								destination: GetChat(ctx)
							});
						}).catch(Logging);
					} else {
						foundUser.selectingGroupName = foundUser.selectingGroupName || plainGroupNameOrSuffix;

						SaveUser(foundUser, ctx)
						.then(() => {
							PushIntoSendingImmediateQueue({
								text: `Группу с названием ${TGE(foundUser.selectingGroupName)} надо уточнить. Просто отправьте мне один из следующих вариантов (скорее всего это название кафедры или направления):\n${foundGroups.map((group) => `<code>${TGE(group.groupSuffix)}</code>`).join("\n")}\n\nЕсли что-то пошло не так, вызовите команду /start ещё раз – выбор группы отменится.`,
								destination: GetChat(ctx),
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
					destination: GetChat(ctx),
					buttons: {
						hide_keyboard: true
					}
				});
			}
		}).catch(Logging)
	}
];

const COMMAND_ALIAS_REGEXP = /[^\p{L}\d\s+-]+/giu;
const COMMANDS_ALIASES = {};
Object.keys(COMMANDS).forEach((key) => {
	const alias = COMMANDS[key].description.replace(COMMAND_ALIAS_REGEXP, "").trim();
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
	// Logging(new Error(`No group for foundUser`), foundUser);

	PushIntoSendingImmediateQueue({
		text: `Ваша группа не найдена. Попробуйте задать её заново в настройках (команда /settings).`,
		destination: GetChat(ctx)
	});
};

/**
 * @param {User} foundUser
 * @param {import("./utils/get-chat").DefaultContext} ctx
 * @returns {Promise}
 */
const SaveUser = (foundUser, ctx) => {
	if (!foundUser.id) return Promise.reject(`No such user`);

	if (ctx?.message?.message_thread_id) foundUser.thread = ctx.message.message_thread_id;

	return new Promise((resolve, reject) => {
		mongoDispatcher.callDB()
		.then((DB) => DB.collection("telegram_users").findOneAndReplace({ id: foundUser.id }, foundUser))
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
 * @typedef {object} SendingMessageType
 * @property {{ id: number, thread?: number }} destination
 * @property {string} text
 * @property {{text: string, callback_data: string, url: string}[][]} [buttons]
 * @property {string} [photo]
 */
/** @type {SendingMessageType[]} */
const IMMEDIATE_QUEUE = [];

/**
 * @param {SendingMessageType} messageData
 * @returns {number}
 */
const PushIntoSendingImmediateQueue = (messageData) => IMMEDIATE_QUEUE.push(messageData);

/** @type {SendingMessageType[]} */
const MAILING_QUEUE = [];

/**
 * @param {SendingMessageType} messageData
 * @returns {number}
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
		telegram.sendPhoto(messageData.destination.id, {
			source: createReadStream(messageData.photo)
		}, {
			message_thread_id: messageData.destination.thread,
			caption: messageData.text,
			parse_mode: "HTML",
			disable_web_page_preview: true,
			reply_markup: messageData.buttons || replyKeyboard
		})
	:
		telegram.sendMessage(messageData.destination.id, messageData.text, {
			message_thread_id: messageData.destination.thread,
			parse_mode: "HTML",
			disable_web_page_preview: true,
			reply_markup: messageData.buttons || replyKeyboard
		})
	);


	return sendingPromise.catch(/** @param {TelegramError} e */ (e) => {
		if (e?.code === 403) {
			const foundUser = USERS.find((user) => user.id === messageData.destination.id);

			if (foundUser) {
				const indexOfFoundUser = USERS.findIndex((user) => user.id === messageData.destination.id);

				if (indexOfFoundUser) {
					USERS.splice(indexOfFoundUser, 1);

					mongoDispatcher.callDB()
					.then((DB) => DB.collection("telegram_users").deleteOne({ id: messageData.destination.id }))
					.catch((e) => Logging(new Error("Error on deleting user from DB", e)));
				} else {
					Logging(new Error(`Could not deleting user with id ${messageData.destination.id} because of critical bug with finding proper user.`), e);
				}
			} else {
				Logging(new Error(`Cannot remove user with id ${messageData.destination.id} because they're not in out users' list!`), e);
			}

			return Promise.resolve({});
		} else if (!!e?.parameters?.migrate_to_chat_id) {
			const foundUser = USERS.find((user) => user.id === messageData.destination.id);

			if (foundUser) {
				mongoDispatcher.callDB()
				.then((DB) => DB.collection("telegram_users").updateOne(
					{ id: messageData.destination.id },
					{ $set: { id: e.parameters.migrate_to_chat_id } }
				))
				.catch((e) => Logging(new Error("Error on updating user from DB", e)));
			} else {
				Logging(new Error(`Cannot update user with id ${messageData.destination.id} because they're not in out users' list!`), e);
			}

			return Promise.resolve({});
		} else {
			return Promise.reject(e);
		}
	});
};

/**
 * @param {SendingMessageType} iMessageData
 * @returns {void}
 */
const ImmediateSendingQueueProcedure = (iMessageData) => {
	const messageData = iMessageData || IMMEDIATE_QUEUE.shift();

	if (!messageData?.destination?.id) return;

	TelegramSend(messageData)
	.catch(/** @param {TelegramError} e */ (e) => {
		if (e && e.code === 429) {
			if (typeof e.parameters?.retry_after == "number")
				setTimeout(() => ImmediateSendingQueueProcedure(messageData), e.parameters?.retry_after * 1e3 + Math.random() * 2e3);
			else
				setTimeout(() => ImmediateSendingQueueProcedure(messageData), 2e3);
		} else
			Logging(new Error(`Error on sending to ${messageData.destination.id}`), e);
	});
};

setInterval(ImmediateSendingQueueProcedure, 50);

/**
 * @param {SendingMessageType} iMessageData
 * @returns {void}
 */
const MailingSendingQueueProcedure = (iMessageData) => {
	const messageData = iMessageData || MAILING_QUEUE.shift();

	if (!messageData?.destination?.id) return;

	TelegramSend(messageData)
	.catch(/** @param {TelegramError} e */ (e) => {
		if (e && e.code === 429) {
			if (typeof e.parameters?.retry_after == "number")
				setTimeout(() => MailingSendingQueueProcedure(messageData), e.parameters?.retry_after * 1e3 + Math.random() * 5e3);
			else
				setTimeout(() => MailingSendingQueueProcedure(messageData), 5e3);
		} else
			Logging(new Error(`Error on sending to ${messageData.destination.id}`), e);
	});
};

setInterval(MailingSendingQueueProcedure, 500);





telegraf.start(/** @param {import("telegraf").Context} ctx */ (ctx) => {
	const foundUser = USERS.find((user) => user.id === GetChat(ctx).id);

	if (!foundUser) {
		/** @type {User} */
		const newUser = {
			id: GetChat(ctx).id,
			thread: GetChat(ctx).thread,
			username: ctx.chat.username || ctx.chat.first_name || ctx.chat.title,
			group: "",
			morning: true,
			evening: true,
			late_evening: true,
			waitingForGroupSelection: true
		}

		USERS.push(newUser);

		mongoDispatcher.callDB()
		.then((DB) => DB.collection("telegram_users").insertOne(newUser))
		.catch(Logging);


		PushIntoSendingImmediateQueue({
			text: COMMANDS["help"].text,
			destination: GetChat(ctx),
			buttons: {
				hide_keyboard: true
			}
		});
	}

	if (foundUser?.group) {
		delete foundUser["selectingGroupName"];
		delete foundUser["waitingForGroupSelection"];
		delete foundUser["waitingForTextForSettings"];

		PushIntoSendingImmediateQueue({
			text: `Начали почти с нуля – ваши прежние настройки на месте.`,
			destination: GetChat(ctx)
		});
	} else {
		PushIntoSendingImmediateQueue({
			text: `Выберите вашу учебную группу. Для этого точно напишите её название. Если необходимо, надо будет уточнить по названию кафедры или направлению (но я скажу, если надо).\n\nЕсли что-то пойдёт не так, вызовите команду /start ещё раз – выбор группы начнётся заново.`,
			destination: GetChat(ctx),
			buttons: {
				hide_keyboard: true
			}
		});
	}
});

telegraf.on("text", (ctx) => {
	const text = ctx.message?.text;
	if (!text) return false;

	const commandMatch = text.match(/^\/([\w_]+)(\@mirea_table_bot)?$/i);

	if (commandMatch && commandMatch[1]) {
		if (COMMANDS[commandMatch[1]]) {
			if (typeof COMMANDS[commandMatch[1]].caller == "function")
				return COMMANDS[commandMatch[1]].caller(ctx);
			else if (typeof COMMANDS[commandMatch[1]].text == "string")
				return PushIntoSendingImmediateQueue({
					text: COMMANDS[commandMatch[1]].text,
					destination: GetChat(ctx)
				});
		}
	}


	const foundUser = USERS.find((user) => user.id === GetChat(ctx).id);

	if (foundUser && foundUser.waitingForGroupSelection) {
		const groupCommandHandler = SETTINGS_COMMANDS.find((handler) => handler.groupSelection);

		if (groupCommandHandler)
			return groupCommandHandler.caller(ctx);
		else
			return PushIntoSendingImmediateQueue({
				text: "Не понял тебя. Если долго ничего не получается, попробуй команду /start. Или посмотри описание бота.",
				destination: GetChat(ctx)
			});
	}

	if (foundUser && foundUser.waitingForTextForSettings) {
		const settingsCommandHandler = SETTINGS_COMMANDS.find((handler) => handler.regexp.test(text));

		if (settingsCommandHandler)
			return settingsCommandHandler.caller(ctx);
		else
			return PushIntoSendingImmediateQueue({
				text: "Не понял тебя. Если долго ничего не получается, попробуй команду /start. Или посмотри описание бота.",
				destination: GetChat(ctx)
			});
	}


	const commandAlias = Capitalize(text.replace(COMMAND_ALIAS_REGEXP, "").trim());

	if (COMMANDS_ALIASES[commandAlias]) {
		if (typeof COMMANDS_ALIASES[commandAlias].caller == "function")
			return COMMANDS_ALIASES[commandAlias].caller(ctx);
		else if (typeof COMMANDS_ALIASES[commandAlias].text == "string")
			return PushIntoSendingImmediateQueue({
				text: COMMANDS_ALIASES[commandAlias].text,
				destination: GetChat(ctx)
			});
	}


	return PushIntoSendingImmediateQueue({
		text: "Не понял тебя. Если долго ничего не получается, попробуй команду /start. Или посмотри описание бота.",
		destination: GetChat(ctx)
	});
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
		delete user["waitingForGroupSelection"];
		delete user["waitingForTextForSettings"];
		delete user["selectingGroupName"];

		PushIntoSendingMailingQueue({
			text: `${LABELS_FOR_TIMES_OF_DAY[timeOfDay]} ${day.nameOfDay}. Расписание:\n\n${day.layout}`,
			destination: user
		});
	});
};

if (!DEV) {
	cron.schedule("0 4 * * *", () => {
		if (!IsSession()) GlobalSendToAllUsers("morning", GetToday);
	});

	cron.schedule("0 16 * * *", () => {
		if (!IsSession()) GlobalSendToAllUsers("evening", GetTomorrow);
	});

	cron.schedule("0 19 * * *", () => {
		if (!IsSession()) GlobalSendToAllUsers("late_evening", GetTomorrow);
	});
}

if (DEV) {
	process.on("unhandledRejection", (reason, p) => {
		Logging("Unhandled Rejection at: Promise", p, "reason:", reason);
	});
}
