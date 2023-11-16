const SECOND = 1e3;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DEV = require("os").platform() === "win32" || process.argv[2] === "DEV";
const { DAYS_OF_WEEK, DATABASE_NAME } = DEV
  ? require("../../../DEV_CONFIGS/telegram-bot.config.json")
  : require("../telegram-bot.config.json");

const MongoDispatcher = require("./database");
const { Capitalize, TGE } = require("./common-utils");
const Logging = require("./logging");
const CheckIfDistant = require("./check-if-distant");
const LessonNameByType = require("./lesson-type");
const mongoDispatcher = new MongoDispatcher(DATABASE_NAME);

let START_OF_WEEKS = 0;

mongoDispatcher
  .callDB()
  .then((DB) => DB.collection("params").findOne({ name: "start_of_weeks" }))
  .then((found) => {
    if (found?.value) START_OF_WEEKS = found.value;
    else return Promise.reject("No <found?.value> for <START_OF_WEEKS>");
  })
  .catch(Logging);

/**
 * @typedef {Object} Option
 * @property {number[]} [weeks]
 * @property {string} name
 * @property {string} type
 * @property {string} [tutor]
 * @property {string} [place]
 * @property {string} [link]
 *
 *
 * @typedef {Option[]} Lesson
 *
 *
 * @typedef {Object} DayOfWeek
 * @property {string} day
 * @property {Lesson[]} odd
 * @property {Lesson[]} even
 *
 *
 * @typedef {DayOfWeek[]} Schedule
 */
/**
 * @typedef {Object} GlobalScheduleGroup
 * @property {String} remoteFile
 * @property {String} unitName
 * @property {String} unitCourse
 * @property {String} groupName
 * @property {String} groupSuffix
 * @property {String[][]} lessonsTimes
 * @property {Schedule} schedule
 */
/** @typedef {{[groupName: string]: GlobalScheduleGroup}} GlobalSchedule */
/**
 * @param {String} iGroup
 * @returns {Promise<GlobalScheduleGroup | null>}
 */
const GetScheduleByGroup = (iGroup) => {
  if (typeof iGroup !== "string") return Promise.resolve(null);

  const [groupName, groupSuffix] = iGroup.split("&");
  if (!groupName) return Promise.resolve(null);

  const searchingQuery = { groupName };
  if (groupSuffix) searchingQuery.groupSuffix = groupSuffix;

  return new Promise((resolveGettingGroup) =>
    mongoDispatcher
      .callDB()
      .then((DB) => DB.collection("study_groups").findOne(searchingQuery))
      .then(
        /** @param {GlobalScheduleGroup} foundGroup */ (foundGroup) => {
          if (foundGroup?.groupName) resolveGettingGroup(foundGroup);
          else resolveGettingGroup(null);
        }
      )
      .catch((e) => resolveGettingGroup(null))
  );
};

/**
 * @returns {Number}
 */
const GetWeek = () => Math.ceil((Date.now() - START_OF_WEEKS) / (7 * 24 * HOUR));

/**
 * @returns {Number}
 */
const GetDay = () => new Date(Date.now() + !DEV * 3 * HOUR).getDay();

/**
 * @param {GlobalScheduleGroup} iGroup
 * @param {Number} iDay
 * @param {Option} iOption
 * @param {Number} iLessonPosition
 * @param {Boolean} [iSkipTime = false]
 * @returns {String}
 */
const BuildOptionLayout = (iGroup, iDay, iOption, iLessonPosition, iSkipTime = false) => {
  return (
    (iSkipTime ? "" : `<u>Пара №${iLessonPosition + 1} (${iGroup?.lessonsTimes?.[iDay]?.[iLessonPosition]})</u>\n`) +
    `<b>${TGE(iOption.name)}</b>` +
    (iOption.type ? ` (${TGE(LessonNameByType(iOption.type))})` : "") +
    (iOption.tutor ? `\n<i>${TGE(iOption.tutor)}</i>` : "") +
    (iOption.place
      ? `${iOption.tutor ? ", " : "\n"}<i>${TGE(CheckIfDistant(iOption) ? "Дистанционно" : iOption.place)}</i>`
      : "") +
    (iOption.link ? `\n<a href="${encodeURI(iOption.link)}">Ссылка на пару</a>` : "")
  );
};

/**
 * @param {GlobalScheduleGroup} iGroup
 * @param {Number} iDay
 * @param {Option[]} iOptions
 * @param {Number} iLessonPosition
 * @param {Number} iWeek
 * @returns {String}
 */
const BuildOption = (iGroup, iDay, iOptions, iLessonPosition, iWeek) =>
  iOptions
    .filter((option) => {
      if (!option) return false;
      if (!option.weeks) return true;

      if (option.weeks instanceof Array) return option.weeks.includes(iWeek);

      return false;
    })
    .map((option, optionIndex) => BuildOptionLayout(iGroup, iDay, option, iLessonPosition, optionIndex > 0))
    .join("\n")
    .trim();

/**
 * @param {GlobalScheduleGroup | String} iGroup
 * @param {Number} iNumberOfDayInWeek
 * @param {Number} iWeek
 * @returns {Promise<String>}
 */
const BuildDay = async (iGroup, iNumberOfDayInWeek, iWeek) => {
  const group = typeof iGroup === "string" ? await GetScheduleByGroup(iGroup) : iGroup;
  if (!group) return null;

  const day = group?.schedule?.[iNumberOfDayInWeek];
  if (!day) return "";

  const lessons = day[iWeek % 2 ? "odd" : "even"];
  if (!lessons) return "";

  return lessons
    .map((lesson, lessonPosition) => BuildOption(iGroup, iNumberOfDayInWeek, lesson, lessonPosition, iWeek))
    .map((option) => option?.trim?.())
    .filter((option) => !!option)
    .join("\n\n")
    .trim();
};

/**
 * @param {GlobalScheduleGroup | String} iGroup
 * @param {Number} iWeek
 * @returns {Promise<String>}
 */
const BuildWeek = async (iGroup, iWeek) => {
  const group = typeof iGroup == "string" ? await GetScheduleByGroup(iGroup) : iGroup;
  if (!group) return "";

  const weekArr = await Promise.all(
    (group?.schedule || []).map(async (day, dayIndex) => {
      const dayLayout = await BuildDay(group, dayIndex, iWeek);

      return Promise.resolve(dayLayout ? `<b>${Capitalize(day.day)}</b>:\n\n${dayLayout}` : "");
    })
  );

  return Promise.resolve(weekArr.filter((day) => !!day).join("\n\n~~~~~~\n\n"));
};

/**
 * @async
 * @callback GettingDayLayout
 * @param {String} iGroupName
 * @returns {Promise<{nameOfDay: string, layout: string} | null>}
 */
/**
 * @type {GettingDayLayout}
 */
const GetToday = async (iGroupName) => {
  const group = await GetScheduleByGroup(iGroupName);
  if (!group) return null;

  const todayFineName = DAYS_OF_WEEK[GetDay() - 1];
  if (!todayFineName) return null;

  const actulaIndexOfDayForGroup = group.schedule.findIndex((day) => day.day.toLowerCase() === todayFineName);
  if (actulaIndexOfDayForGroup < 0) return null;

  const todayLayout = await BuildDay(group, GetDay() - 1, GetWeek());
  if (todayLayout) return Promise.resolve({ nameOfDay: todayFineName, layout: todayLayout });

  return Promise.resolve(null);
};

/**
 * @type {GettingDayLayout}
 */
const GetTomorrow = async (iGroupName) => {
  const group = await GetScheduleByGroup(iGroupName);
  if (!group) return null;

  const tomorrowFineName = DAYS_OF_WEEK[GetDay()];
  if (!tomorrowFineName) return null;

  const actulaIndexOfDayForGroup = group.schedule.findIndex((day) => day.day.toLowerCase() === tomorrowFineName);
  if (actulaIndexOfDayForGroup < 0) return null;

  const tomorrowLayout = await BuildDay(group, GetDay(), GetWeek() + (GetDay() === 0));
  if (tomorrowLayout) return Promise.resolve({ nameOfDay: tomorrowFineName, layout: tomorrowLayout });

  return Promise.resolve(null);
};

module.exports = exports = {
  GetScheduleByGroup,
  GetWeek,
  GetDay,
  BuildOptionLayout,
  BuildOption,
  BuildDay,
  BuildWeek,
  GetToday,
  GetTomorrow
};
