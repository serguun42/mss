const
	fs = require("fs"),
	util = require("util"),
	fsWriteFile = util.promisify(fs.writeFile),
	xlsx = require("node-xlsx").default,
	fetch = require("node-fetch").default,
	ParseHTML = require("node-html-parser").parse,


	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		DATABASE_NAME,
		DAYS_OF_WEEK,
		SCHEDULE_LINK,
		SCRAPPER_COOKIE,
		INDEX_OF_LINE_WITH_GROUPS_NAMES
	} = DEV ? require("../../DEV_CONFIGS/scrapper.config.json") : require("./scrapper.config.json"),
	FIXES = require("./scrapper.fixes.json"),


	MongoDispatcher = require("./utils/database.js"),
	mongoDispatcher = new MongoDispatcher(DATABASE_NAME),


	Logging = require("./utils/logging.js");



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
 * @property {string} remoteFile
 * @property {string} unitName
 * @property {string} unitCourse
 * @property {string} groupName
 * @property {string} groupSuffix
 * @property {Date} updatedDate
 * @property {string[][]} lessonsTimes
 * @property {Schedule} schedule
 */
/** @typedef {GlobalScheduleGroup[]} GlobalSchedule */
/** @type {GlobalSchedule} */
const GLOBAL_SCHEDULE = [];






const XLSX_FILES_HREF_REGEXP = /<[\w]+(\s+[\w\-]+(\=("|')[^"']*(\3))?)*\sclass="([^"]*\s+)*uk-link-toggle(\s+[^"]*)*"(\s+[\w\-]+(\=("|')[^"']*(\9))?)*\s+href="([^"]+)"(\s+[\w\-]+(\=("|')[^"']*(\14))?)*>/gi,
	  XLSX_FILES_HREF_REGEXP_GROUP_INDEX = 11;

const XLSX_FILES_COURSE_REGEXP = /<[\w]+(\s+[\w\-]+(\=("|')[^"']*(\3))?)*\sclass="([^"]*\s+)*uk-link-heading uk-margin-small-top(\s+[^"]*)*"(\s+[\w\-]+(\=("|')[^"']*(\9))?)*>([^<]+)/gi,
	  XLSX_FILES_COURSE_REGEXP_GROUP_INDEX = 11;

/**
 * @param {number[]} iArray
 * @param {number} iPos
 * @returns {number}
 */
const GlobalReduceArrayToIndex = (iArray, iPos) => iArray.reduce((accum, current, index) => index >= iPos ? accum : accum + current, 0);

/**
 * @param {Buffer} iXLSXData
 * @returns {Promise<{ name: string, data: (string | Buffer)[][] }[]>}
 */
const GlobalSafeParseXLSX = iXLSXData => new Promise((resolve, reject) => {
	try {
		const parsedData = xlsx.parse(iXLSXData);
		resolve(parsedData);
	} catch (e) {
		reject(e);
	}
});

/**
 * @param {string | number | null} iRawComplexLesson
 * @returns {string[] | null}
 */
const ParseLessonPartsAndOptions = iRawComplexLesson => {
	if (!iRawComplexLesson) return null;
	if (typeof iRawComplexLesson == "number") iRawComplexLesson = iRawComplexLesson.toString();
	if (typeof iRawComplexLesson !== "string") return null;

	Object.keys(FIXES).forEach((regexpRaw) => {
		iRawComplexLesson = iRawComplexLesson.replace(new RegExp(regexpRaw, "g"), FIXES[regexpRaw]);
	});

	return iRawComplexLesson.replace(/\r/g, "").split("\n").filter(i => !!i) || null;
};

/**
 * @typedef {Object} XLSXFileDefinition
 * @property {string} remoteFile
 * @property {string} unitName
 * @property {string} unitCourse
 */
/**
 * @typedef {Object} XLSXFileData
 * @property {string} remoteFile
 * @property {Buffer} fileData
 * @property {string} unitName
 * @property {string} unitCourse
 */
/**
 * @returns {Promise<XLSXFileDefinition[]>}
 */
const GetLinkToFiles = () => new Promise((resolve, reject) => {
	fetch(SCHEDULE_LINK, {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "en-US,en;q=0.9,ru;q=0.8",
			"cache-control": "no-cache",
			"pragma": "no-cache",
			"sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
			"sec-ch-ua-mobile": "?0",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": SCRAPPER_COOKIE
		},
	}).then((res) => {
		if (res.status === 200)
			return res.text();
		else
			return Promise.reject(res.status);
	}).then((page) => {
		if (DEV) fsWriteFile("./out/mirea-ru-schedule.html", page).catch(() => {});


		const allXLSXDefinitionsToResolve = [],
			  parsedPage = ParseHTML(page, { lowerCaseTagName: true }),
			  UNITS_NAMES = parsedPage.querySelectorAll(".rasspisanie .uk-active a").map((anchor) => anchor.innerText),
			  UNITS_HTML_BLOCKS = parsedPage.querySelector(".uk-switcher").childNodes.filter((child) => child.nodeType === 1);


		UNITS_HTML_BLOCKS.forEach(/** @param {import("node-html-parser").HTMLElement} unitHTMLBlock */ (unitHTMLBlock, unitIndex) => {
			if (!unitHTMLBlock || unitHTMLBlock.nodeType !== 1) return;

			unitHTMLBlock.querySelectorAll(".uk-card.slider_ads.uk-card-body.uk-card-small").forEach((instituteCard) => {
				const instituteName = instituteCard.querySelector(".uk-text-bold")?.innerText;

				if (!instituteName) return;


				instituteCard.outerHTML.split("<hr").forEach((subInstitute) => {
					// Layout расписания вне сессии
					const usualTableCardsLayout = subInstitute.split("Расписание занятий")?.[1]?.split(/расписание/i)[0];


					const subInstituteLinks = [],
						  subInstituteCourses = [];

					let lastHrefExec;
					while (lastHrefExec = XLSX_FILES_HREF_REGEXP.exec(usualTableCardsLayout)) {
						subInstituteLinks.push(lastHrefExec[XLSX_FILES_HREF_REGEXP_GROUP_INDEX]);
					}

					let lastCourseExec;
					while (lastCourseExec = XLSX_FILES_COURSE_REGEXP.exec(usualTableCardsLayout)) {
						subInstituteCourses.push(lastCourseExec[XLSX_FILES_COURSE_REGEXP_GROUP_INDEX]?.trim?.());
					}


					subInstituteLinks.map((link, index) => ({
						remoteFile: link,
						unitName: instituteName,
						unitCourse: `${UNITS_NAMES[unitIndex]}${subInstituteCourses[index] ? ", " + subInstituteCourses[index] : ""}`,
					})).forEach((def) => allXLSXDefinitionsToResolve.push(def));
				});
			});
		});


		resolve(allXLSXDefinitionsToResolve);
	}).catch((e) => reject(e));
});

/**
 * @param {XLSXFileDefinition[]} iXLSXFileDefinitions
 * @returns {Promise<XLSXFileData[]>}
 */
const GetTablesFiles = (iXLSXFileDefinitions) => new Promise((resolve, reject) => {
	if (!iXLSXFileDefinitions || !(iXLSXFileDefinitions instanceof Array))
		return reject({
			message: `Error on getting link to xlsx files. Wrong link to table files`,
			err: iXLSXFileDefinitions
		});


	/** @type {XLSXFileData[]} */
	const allXLSXFilesData = [];


	const LocalRecurion = (iIndex) => {
		const gettingFileProps = iXLSXFileDefinitions[iIndex];

		if (!gettingFileProps)
			return resolve(allXLSXFilesData);


		if (DEV) Logging(`Getting file ${encodeURI(gettingFileProps.remoteFile)}`);

		fetch(encodeURI(gettingFileProps.remoteFile)).then((res) => {
			if (res.status === 200)
				return res.buffer();
			else
				return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
		}).then((fileData) => {
			allXLSXFilesData.push({
				fileData,
				...gettingFileProps
			});

			if (DEV) fsWriteFile(`./data/${gettingFileProps.remoteFile.replace("https://webservices.mirea.ru/upload/iblock", "").replace(/[^\wа-яё]/gi, "_")}`, fileData).catch(() => {});
		}).catch((e) => {
			Logging(`Error on getting ${gettingFileProps.remoteFile}`, e);
		}).finally(() => setTimeout(() => LocalRecurion(iIndex + 1), 500));
	};


	LocalRecurion(0);
});

/**
 * @param {XLSXFileData[]} iXLSXFilesData
 * @returns {Promise<GlobalSchedule>}
 */
const BuildGlobalSchedule = (iXLSXFilesData) => new Promise((resolve) => {
	/**
	 * @param {number} index
	 * @returns {void}
	 */
	const LocalParseSingleFile = (index) => {
		const XLSXFileData = iXLSXFilesData[index];

		if (!XLSXFileData) return resolve(GLOBAL_SCHEDULE);


		GlobalSafeParseXLSX(XLSXFileData.fileData).then((workSheetsFromFile) => {
			const tableSheet = workSheetsFromFile[0];

			const tableData = tableSheet.data;
			if (!tableData) return;


			const lineWithGroups = tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES];
			if (!(lineWithGroups instanceof Array)) return Promise.reject(`No groups in the sheet`);


			const indexesOfCellsWithGroupNames = lineWithGroups.map((cell, index) => {
				if (typeof cell !== "string") return null;

				if (/^[\wа-яё]{4}-\d{2}-\d{2}/i.test(cell?.trim?.()))
					return index;
				else
					return null;
			}).filter((index) => index !== null);


			let finalRowIndex = INDEX_OF_LINE_WITH_GROUPS_NAMES + 2 + 72;

			tableData.forEach((row, rowIndex) => {
				if (/Начальник\s+УМУ/gi.test(row[2])) finalRowIndex = rowIndex;
			});


			/** @type {number[]} */
			const daysByLessonsNumber = new Array(6).fill(0);

			let currentDay = -1;
			tableData
				.slice(INDEX_OF_LINE_WITH_GROUPS_NAMES + 2, finalRowIndex)
				.forEach((row) => {
					if (row[0]) ++currentDay;

					++daysByLessonsNumber[currentDay];
				});


			/** @type {string[][]} */
			const lessonsTimes = daysByLessonsNumber.map((day, dayIndex) => {
				const skipLines = GlobalReduceArrayToIndex(daysByLessonsNumber, dayIndex);

				const timesForDay = new Array(day).fill(true).map((lessonTime, indexOfLessonTime) => {
					const currentLessonRowIndex = INDEX_OF_LINE_WITH_GROUPS_NAMES + 2 + skipLines + indexOfLessonTime,
						  currentRowLessonStart = tableData[currentLessonRowIndex][2],
						  currentRowLessonEnd = tableData[currentLessonRowIndex][3];

					if (
						currentRowLessonStart &&
						typeof currentRowLessonStart == "string" &&
						currentRowLessonEnd &&
						typeof currentRowLessonEnd == "string"
					)
						return `${currentRowLessonStart.replace(/(\d+)(:|-)(\d+)/, "$1:$3")} – ${currentRowLessonEnd.replace(/(\d+)(:|-)(\d+)/, "$1:$3")}`;
					else
						return null;
				}).filter((lessonTimes) => lessonTimes !== null);

				return timesForDay;
			});


			indexesOfCellsWithGroupNames.forEach((indexOfCertainGroup) => {
				const certainGroupTable = tableData
										  .slice(INDEX_OF_LINE_WITH_GROUPS_NAMES + 2, finalRowIndex)
										  .map(row => row.slice(indexOfCertainGroup, indexOfCertainGroup + 5));

				/** @type {string} */
				const certainGroupName = (tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup] || "")
										 ?.replace?.(/[\r\n]/g, "")
										 ?.replace?.(/^([\wа-яё]{4}-\d{2}-\d{2}).*$/i, "$1")
										 ?.trim?.();

				/** @type {string} */
				const certainGroupSuffix = (
					tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup + 1] ||
					tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup + 2] ||
					tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup + 3]
				)
					?.replace?.(/[\r\n]/g, "")
					||
					tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup]
						?.replace?.(/[\r\n]/g, "")
						?.replace?.(/^[\wа-яё]{4}-\d{2}-\d{2}(.*)$/i, "$1")
						?.replace?.(/[\(\)]/g, "")
						?.trim?.();


				/** @type {Schedule} */
				const schedule = [];

				certainGroupTable.forEach((lessonOption, lessonOptionIndex) => {
					let dayOfWeek = 0;
					while (GlobalReduceArrayToIndex(daysByLessonsNumber, dayOfWeek + 1) <= lessonOptionIndex) {
						++dayOfWeek;
					}

					if (!schedule[dayOfWeek]) schedule[dayOfWeek] = {
						day: DAYS_OF_WEEK[dayOfWeek],
						odd: [],
						even: []
					}


					const splittedLesson = {
						name: ParseLessonPartsAndOptions(lessonOption[0]),
						type: ParseLessonPartsAndOptions(lessonOption[1]),
						tutor: ParseLessonPartsAndOptions(lessonOption[2]),
						place: ParseLessonPartsAndOptions(lessonOption[3]),
						link: ParseLessonPartsAndOptions(lessonOption[4])
					};

					const formedLesson = [];

					if (splittedLesson.name && splittedLesson.name instanceof Array)
						splittedLesson.name.forEach((optionName, optionIndex) => {
							/** @type {number[] | null} */
							let weeks = null,
								weeksExclude = [],
								weeksMatch = optionName.match(/^([\d\,]+)\s?н\.?\s/);

							if (weeksMatch && weeksMatch[1])
								weeks = weeksMatch[1];
							else
								weeks = null;

							if (!weeks) {
								weeksMatch = optionName.match(/^((\d+)\-(\d+))\s?н\.?\s/);

								if (weeksMatch && weeksMatch[1] && weeksMatch[2] && weeksMatch[3]) {
									let weeksArr = [],
										startingWeek = parseInt(weeksMatch[2]),
										endingWeek = parseInt(weeksMatch[3]);

									for (let i = startingWeek; i <= endingWeek; i += 2)
										weeksArr.push(i);

									weeks = weeksArr.join(",");
								} else
									weeks = null;
							}

							if (!weeks) {
								weeksMatch = optionName.match(/^кр\.?\s*([\d\,]+)\s*н\.?\s/i);

								if (weeksMatch && weeksMatch[1]) {
									weeksExclude = weeksMatch[1].split(",").map((week) => parseInt(week));
								} else
									weeksExclude = [];
							}

							if (weeksExclude.length) {
								if (!weeks) {
									weeks = [];

									/**
									 * if lessonOptionIndex % 2 === 0
									 * then
									 *  [0]    [2]    [4]   index
									 * 	first, third, fifth, so on row – odd days
									 * elif lessonOptionIndex % 2 === 1
									 * then
									 *  [1]    [3]    [5]   index
									 * 	second, fourth, sixth
									 * fi
									 */
									for (let i = 1 + lessonOptionIndex % 2; i <= 16; i += 2) {
										if (!weeksExclude.includes(i))
											weeks.push(i);
									}

									weeks = weeks.join(",");
								} else {
									weeks = weeks
											.split(",").map((week) => parseInt(week))
											.filter((week) => !weeksExclude.includes(week))
											.join(",");
								}
							}

							formedLesson.push({
								weeks: weeks ? weeks.split(",").map((week) => parseInt(week)) : null,
								name: weeks ?
										optionName
										.replace(/^([\d\,]+)\s?н\.?\s/, "")
										.replace(/^((\d+)\-(\d+))\s?н\.?\s/, "")
										.replace(/^кр\.?\s*([\d\,]+)\s*н\.?\s/i, "")
										.trim()
										:
										optionName.trim(),
								type: splittedLesson.type ? splittedLesson.type[optionIndex] || null : null,
								tutor: splittedLesson.tutor ? splittedLesson.tutor[optionIndex] || null : null,
								place: splittedLesson.place ? splittedLesson.place[optionIndex] || null : null,
								link: splittedLesson.link ? splittedLesson.link[optionIndex] ? splittedLesson.link[optionIndex] : (splittedLesson.link[optionIndex - 1] || null) : null
							});
						});

					if (lessonOptionIndex % 2)
						schedule[dayOfWeek].even.push(formedLesson);
					else
						schedule[dayOfWeek].odd.push(formedLesson);
				});


				/** @type {GlobalScheduleGroup} */
				const groupObjectForGlobal = {
					groupName: certainGroupName,
					groupSuffix: certainGroupSuffix,
					remoteFile: XLSXFileData.remoteFile,
					unitName: XLSXFileData.unitName,
					unitCourse: XLSXFileData.unitCourse,
					lessonsTimes: lessonsTimes,
					updatedDate: new Date(),
					schedule: schedule,
				};


				GLOBAL_SCHEDULE.push(groupObjectForGlobal);
			});
		})
		.catch((e) => Logging(`Error on parsing xlsx (URL: ${XLSXFileData.remoteFile} | unitName: ${XLSXFileData.unitName} | unitCourse: ${XLSXFileData.unitCourse})`, e))
		.finally(() => LocalParseSingleFile(index + 1));
	};

	LocalParseSingleFile(0);
});


GetLinkToFiles()
.then((allLinksToXLSXFiles) => GetTablesFiles(allLinksToXLSXFiles))
.then((allXLSXFilesData) => BuildGlobalSchedule(allXLSXFilesData))
.then(() => {
	if (DEV) {
		Logging("Got all files. Go see ./out/global-schedule.json");
		fsWriteFile("./out/global-schedule.json", JSON.stringify(GLOBAL_SCHEDULE, false, "\t"));
	}

	return mongoDispatcher.callDB()
	.then((DB) => {
		const STUDY_GROUPS_COLLECTION = DB.collection("study-groups");

		return STUDY_GROUPS_COLLECTION.insertMany(GLOBAL_SCHEDULE)
		.then(() => new Promise((resolveClearingPrevious) => {
			/**
			 * @param {number} iIndex
			 */
			const LocalRecurionRemove = iIndex => {
				const studyGroupProps = GLOBAL_SCHEDULE[iIndex];
				if (!studyGroupProps) return resolveClearingPrevious();

				STUDY_GROUPS_COLLECTION.findOneAndDelete({
					groupName: studyGroupProps.groupName,
					groupSuffix: studyGroupProps.groupSuffix,
					updatedDate: {
						$lt: studyGroupProps.updatedDate
					}
				})
				.catch(() => {})
				.finally(() => LocalRecurionRemove(iIndex + 1));
			};

			LocalRecurionRemove(0);
		}))
		.then(() => DB.collection("params").findOneAndUpdate(
			{ name: "scrapper_updated_date" },
			{ $set: {
				value: new Date()
			} }
		))
		.then(() => mongoDispatcher.closeConnection());
	});
})
.catch((e) => {
	Logging(e);
	mongoDispatcher.closeConnection();
});
