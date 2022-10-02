const
	fs = require("fs"),
	util = require("util"),
	fsWriteFile = util.promisify(fs.writeFile),
	xlsx = require("node-xlsx").default,
	fetch = require("node-fetch").default,
	ParseHTML = require("node-html-parser").parse,
	{ SocksProxyAgent } = require('socks-proxy-agent'),


	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		DATABASE_NAME,
		DAYS_OF_WEEK,
		SCHEDULE_PAGES,
		INDEX_OF_LINE_WITH_GROUPS_NAMES,
		PROXY_PORT
	} = DEV ? require("../../DEV_CONFIGS/scrapper.config.json") : require("./scrapper.config.json"),
	FIXES = require("./scrapper.fixes.json"),


	MongoDispatcher = require("./utils/database.js"),
	mongoDispatcher = new MongoDispatcher(DATABASE_NAME),


	proxyAgent = (PROXY_PORT ? new SocksProxyAgent({ hostname: "localhost", port: PROXY_PORT }) : null),


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
const UPDATE_TIMESTAMP = new Date();




/**
 * @param {string} [cookie]
 * @returns {import("node-fetch").RequestInit}
 */
const BuildFetchOptions = (cookie) => ({
	headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		"accept-language": "en-US,en;q=0.9,ru;q=0.8",
		"cache-control": "no-cache",
		"pragma": "no-cache",
		"Sec-Fetch-Dest": `document`,
		"Sec-Fetch-Mode": `navigate`,
		"Sec-Fetch-Site": `none`,
		"Sec-Fetch-User": `?1`,
		"Upgrade-Insecure-Requests": `1`,
		"User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36`,
		"sec-ch-ua": `"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"`,
		"sec-ch-ua-mobile": `?0`,
		"sec-ch-ua-platform": `"Windows"`,
		"cookie": cookie || null
	},
	agent: proxyAgent
});

/**
 * @param {number} delay
 * @returns {Promise<null>}
 */
const Wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay || 0));

/**
 * @param {number[]} array
 * @param {number} position
 * @returns {number}
 */
const GlobalReduceArrayToIndex = (array, position) =>
	array.reduce((accum, current, index) => index >= position ? accum : accum + current, 0);

/**
 * @param {Buffer} XLSXData
 * @returns {Promise<{ name: string, data: (string | Buffer)[][] }[]>}
 */
const GlobalSafeParseXLSX = (XLSXData) => new Promise((resolve, reject) => {
	try {
		const parsedData = xlsx.parse(XLSXData);
		resolve(parsedData);
	} catch (e) {
		reject(e);
	}
});

/**
 * @param {string | number | null} rawComplexLesson
 * @returns {string[] | null}
 */
const ParseLessonPartsAndOptions = (rawComplexLesson) => {
	if (!rawComplexLesson) return null;
	if (typeof rawComplexLesson == "number") rawComplexLesson = rawComplexLesson.toString();
	if (typeof rawComplexLesson !== "string") return null;

	Object.keys(FIXES).forEach((regexpRaw) => {
		rawComplexLesson = rawComplexLesson.replace(new RegExp(regexpRaw, "g"), FIXES[regexpRaw]);
	});

	return rawComplexLesson
	.replace(/\r/g, "")
	/** Replace split for actual messed up subgroups from multiple spaces to single line break */
	.replace(/\u0020{6,}/g, "\n")
	.split("\n")
	.map((value) => typeof value === "string" ? value.trim() : value)
	.filter(Boolean);
};

/**
 * @param {string} place
 * @returns {string}
 */
const TrimOptionPlace = (place) => {
	if (typeof place !== "string") return place;

	return place.replace(/^(ауд|комп)\.?\s?/i, "").trim();
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
 * @returns {Promise<XLSXFileDefinition[][]>}
 */
const GetLinkToFiles = () => Promise.all(SCHEDULE_PAGES.map((schedulePage, schedulePageIndex) =>
	fetch(schedulePage.baseUrl, BuildFetchOptions(schedulePage.cookie)).then((res) => {
		if (res.status === 200)
			return res.text();
		else
			return Promise.reject(new Error(`Error on getting ${schedulePage.baseUrl}\nStatus code ${res.status} ${res.statusText}`));
	}).then((page) => {
		if (DEV) fsWriteFile(`./out/mirea-ru-${schedulePage.type}-${schedulePageIndex}.html`, page).catch(() => {});


		/** @type {XLSXFileDefinition[]} */
		const allXLSXDefinitions = [];
		const parsedMainPage = ParseHTML(page, { lowerCaseTagName: true });


		if (schedulePage.type === "main") {
			const XLSX_FILES_HREF_REGEXP = /<[\w]+(\s+[\w\-]+(\=("|')[^"']*(\3))?)*\sclass="([^"]*\s+)*uk-link-toggle(\s+[^"]*)*"(\s+[\w\-]+(\=("|')[^"']*(\9))?)*\s+href="([^"]+)"(\s+[\w\-]+(\=("|')[^"']*(\14))?)*>/gi;
			const XLSX_FILES_HREF_REGEXP_GROUP_INDEX = 11;

			const XLSX_FILES_COURSE_REGEXP = /<[\w]+(\s+[\w\-]+(\=("|')[^"']*(\3))?)*\sclass="([^"]*\s+)*uk-link-heading uk-margin-small-top(\s+[^"]*)*"(\s+[\w\-]+(\=("|')[^"']*(\9))?)*>([^<]+)/gi;
			const XLSX_FILES_COURSE_REGEXP_GROUP_INDEX = 11;

			/** `"Бакалавриат, магистратура, etc."` */
			const unitsNames = parsedMainPage.querySelectorAll(".schedule .uk-active a").map((anchor) => anchor.innerText);
			const unitsHTMLBlocks = parsedMainPage.querySelector(".uk-switcher").childNodes.filter((child) => child.nodeType === 1);


			unitsHTMLBlocks.forEach(/** @param {import("node-html-parser").HTMLElement} unitHTMLBlock */ (unitHTMLBlock, unitIndex) => {
				if (!unitHTMLBlock || unitHTMLBlock.nodeType !== 1) return;

				unitHTMLBlock.querySelectorAll(".uk-card.slider_ads.uk-card-body.uk-card-small").forEach((instituteCard) => {
					const instituteName = instituteCard.querySelector(".uk-text-bold")?.innerText;

					if (!instituteName) return;


					instituteCard.outerHTML.split("<hr").forEach((subInstitute) => {
						/** Layout расписания вне сессии */
						const usualTableCardsLayout = subInstitute.split("Расписание занятий")?.[1]?.split(/расписание/i)[0];


						const subInstituteLinks = [];
						const subInstituteCourses = [];

						let lastHrefExec;
						while (lastHrefExec = XLSX_FILES_HREF_REGEXP.exec(usualTableCardsLayout)) {
							subInstituteLinks.push(lastHrefExec[XLSX_FILES_HREF_REGEXP_GROUP_INDEX]);
						}

						let lastCourseExec;
						while (lastCourseExec = XLSX_FILES_COURSE_REGEXP.exec(usualTableCardsLayout)) {
							subInstituteCourses.push(lastCourseExec[XLSX_FILES_COURSE_REGEXP_GROUP_INDEX]?.trim?.());
						}


						allXLSXDefinitions.push(
							...subInstituteLinks.map(/** @return {XLSXFileDefinition} */ (link, index) => ({
								remoteFile: link,
								unitName: instituteName,
								unitCourse: `${unitsNames[unitIndex]}${subInstituteCourses[index] ? ", " + subInstituteCourses[index] : ""}`,
							}))
						);
					});
				});
			});


			return Promise.resolve(allXLSXDefinitions);
		} else if (schedulePage.type === "fryazino") {
			const NEWS_HEADER_TARGET_REGEXP = /Расписани.*семестра.*\d{2,4}-?\d{2,4}.*г(?:ода|.)?\s(\d+(?:-\d+)?\sкурс(?:.*формы)?)/i;
			const NEWS_HEADER_TARGET_GROUP_INDEX = 1;
			const FRYAZINO_UNIT_NAME = "Филиал Фрязино";

			const newsHeaders = parsedMainPage.querySelectorAll(".news-list .news-item-header").filter((header) =>
				NEWS_HEADER_TARGET_REGEXP.test(header.innerText)
			);

			/**
			 * @typedef {Object} FryazinoScheduleNewsTarget
			 * @property {string} unitName See `FRYAZINO_UNIT_NAME`
			 * @property {string} unitCourse `"Бакалавриат/магистратура 1/2/3 курса"`
			 * @property {string} targetPageUrl Link to page where to find link to XLSX
			 */
			/** @type {FryazinoScheduleNewsTarget[]} */
			const scheduleNewsTargets = newsHeaders.map((header) => {
				const targetPageUrl = header.querySelector("a")?.getAttribute("href");
				const unitCourse = header.innerText.match(NEWS_HEADER_TARGET_REGEXP)?.[NEWS_HEADER_TARGET_GROUP_INDEX];

				return {
					unitName: FRYAZINO_UNIT_NAME,
					unitCourse,
					targetPageUrl: new URL(targetPageUrl, schedulePage.baseUrl).href
				}
			});

			return Promise.all(scheduleNewsTargets.map((scheduleNewsTarget, scheduleNewsTargetIndex) =>
				Wait(scheduleNewsTargetIndex * 500)
				.then(() => fetch(scheduleNewsTarget.targetPageUrl, BuildFetchOptions(schedulePage.cookie)))
				.then((res) => {
					if (res.status === 200)
						return res.text();
					else
						return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
				}).then((scheduleNewsTargetPage) => {
					const parsedNewsTargetPage = ParseHTML(scheduleNewsTargetPage, { lowerCaseTagName: true });
					const xslxLink = parsedNewsTargetPage.querySelector(".doc_item.clearfix a")?.getAttribute?.("href");

					/** @type {XLSXFileDefinition} */
					const scheduleNewsTargetXLSXDefinition = {
						remoteFile: decodeURI(new URL(xslxLink, schedulePage.baseUrl).href),
						unitCourse: scheduleNewsTarget.unitCourse,
						unitName: scheduleNewsTarget.unitName
					};

					return Promise.resolve(scheduleNewsTargetXLSXDefinition);
				}).catch((e) => {
					// Logging(`Error on getting ${scheduleNewsTarget.targetPageUrl}`, e);
					return Promise.resolve(null);
				})
			));
		}
	})
));

/**
 * @param {XLSXFileDefinition[]} allXLSXDefinitions
 * @returns {Promise<XLSXFileData[]>}
 */
const GetTablesFiles = (allXLSXDefinitions) => new Promise((resolve, reject) => {
	if (!allXLSXDefinitions || !(allXLSXDefinitions instanceof Array))
		return reject({
			message: `Error on getting link to xlsx files. Wrong link to table files`,
			err: allXLSXDefinitions
		});


	/** @type {XLSXFileData[]} */
	const allXLSXFilesData = [];


	const LocalRecurion = (iIndex) => {
		const gettingFileProps = allXLSXDefinitions[iIndex];

		if (!gettingFileProps)
			return resolve(allXLSXFilesData);


		if (DEV) Logging(`Getting file ${encodeURI(gettingFileProps.remoteFile)}`);

		fetch(encodeURI(gettingFileProps.remoteFile), BuildFetchOptions()).then((res) => {
			if (res.status === 200)
				return res.buffer();
			else
				return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
		}).then((fileData) => {
			allXLSXFilesData.push({
				fileData,
				...gettingFileProps
			});

			if (DEV)
				fsWriteFile(`./data/${
					new URL(gettingFileProps.remoteFile).pathname
					.replace("/upload/iblock", "")
					.replace(/[^\wа-яё_.]/gi, "_")
				}`, fileData).catch(() => {});
		}).catch((e) => {
			// Logging(`Error on getting ${gettingFileProps.remoteFile}`, e);
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


		GlobalSafeParseXLSX(XLSXFileData.fileData)
		.then((workSheetsFromFile) =>
			workSheetsFromFile.map((tableSheet) => {
				const tableData = tableSheet.data;
				if (!tableData) return;


				const lineWithGroups = tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES];
				if (!(lineWithGroups instanceof Array)) return;


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

						if (splittedLesson.name && splittedLesson.name instanceof Array) {
							splittedLesson.name = splittedLesson.name.map((optionName) =>
								optionName.replace(/^кр\.\s17?\sн\./i, "").trim()
							);

							/** Messed up subgroups with their indices on the second line */
							if (splittedLesson.name.length === 2 && /(\d+\s*п\/г)(,\1)*/i.test(splittedLesson.name[1]))
								splittedLesson.name[0] = `${splittedLesson.name[0]} ${
									splittedLesson.name.pop().replace(/([\d,])/g, "$1 ")
								}`.trim();

							if (
								splittedLesson.name.length === 2 &&
								/военн/i.test(splittedLesson.name[0]) &&
								/подг/i.test(splittedLesson.name[1])
							)
								splittedLesson.name[0] = `${splittedLesson.name[0]} ${splittedLesson.name.pop()}`.trim();

							if (splittedLesson.place instanceof Array)
								splittedLesson.place = splittedLesson.place.map(TrimOptionPlace);

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
									/**
									 * In the single lesson any type is always the same
									 * because lesson holds options for different subgroups
									 * (indicated whether by messed up ones or line break/multiple spaces)
									 */
									type: splittedLesson.type
										? splittedLesson.type[optionIndex]
										|| splittedLesson.type[0]
										|| null : null,
									tutor: splittedLesson.tutor
										? splittedLesson.tutor[optionIndex]
										|| splittedLesson.tutor[0]
										|| null : null,
									place: splittedLesson.place
										? splittedLesson.place[optionIndex]
										|| splittedLesson.place[0]
										|| null : null,
									link: splittedLesson.link
										? splittedLesson.link[optionIndex]
										|| splittedLesson.link[optionIndex - 1]
										|| null : null
								});
							});
						}

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
						updatedDate: UPDATE_TIMESTAMP,
						schedule: schedule,
					};


					GLOBAL_SCHEDULE.push(groupObjectForGlobal);
				});
			})
		)
		.catch((e) => {
			// Logging(`Error on parsing xlsx (URL: ${XLSXFileData.remoteFile} | unitName: ${XLSXFileData.unitName} | unitCourse: ${XLSXFileData.unitCourse})`, e);
		})
		.finally(() => LocalParseSingleFile(index + 1));
	};

	LocalParseSingleFile(0);
});


GetLinkToFiles()
.then((allXLSXDefinitions) => GetTablesFiles(allXLSXDefinitions.flat()))
.then((allXLSXFilesData) => BuildGlobalSchedule(allXLSXFilesData))
.then(() => {
	if (DEV) {
		Logging("Got all files. Go see ./out/global-schedule.json");
		fsWriteFile("./out/global-schedule.json", JSON.stringify(GLOBAL_SCHEDULE, false, "\t"));
	}

	return mongoDispatcher.callDB()
	.then((DB) => {
		/** @type {import("mongodb").Collection<GlobalScheduleGroup>} */
		const STUDY_GROUPS_COLLECTION = DB.collection("study-groups");
		const PARAMS_COLLECTION = DB.collection("params");

		if (!GLOBAL_SCHEDULE.length) return Promise.resolve();

		return STUDY_GROUPS_COLLECTION.insertMany(GLOBAL_SCHEDULE)
		.then(() => new Promise((resolveClearingPrevious) => {
			/**
			 * @param {number} clearingGroupIndex
			 */
			const LocalRecurionRemove = async (clearingGroupIndex) => {
				const studyGroupProps = GLOBAL_SCHEDULE[clearingGroupIndex];
				if (!studyGroupProps) return resolveClearingPrevious();

				const successfullyDeletedSameButPrevious = (
					await STUDY_GROUPS_COLLECTION.deleteMany({
						groupName: studyGroupProps.groupName,
						groupSuffix: studyGroupProps.groupSuffix,
						updatedDate: {
							$lt: studyGroupProps.updatedDate
						}
					})
					.catch(() => Promise.resolve({ deletedCount: 0 }))
				)?.deletedCount;

				if (successfullyDeletedSameButPrevious)
					return LocalRecurionRemove(clearingGroupIndex + 1);

				STUDY_GROUPS_COLLECTION.deleteMany({
					groupName: studyGroupProps.groupName,
					updatedDate: {
						$lt: studyGroupProps.updatedDate
					}
				})
				.catch(() => {})
				.finally(() => LocalRecurionRemove(clearingGroupIndex + 1));
			};

			LocalRecurionRemove(0);
		}))
		.then(() =>
			STUDY_GROUPS_COLLECTION.aggregate([
				{ $group: { _id: "$groupName", count: { $sum: 1 }, groupSuffix: { $push: "$groupSuffix" } } },
				{ $match: { _id: { $ne: null }, count: { $gt: 1 } } },
				{ $project: { groupName: "$_id", count: 1, groupSuffix: 1, _id: 0 } }
			])
			.toArray()
			.then(
				/** @param {{ count: number, groupSuffix: string[], groupName: string }[]} aggregatedGroups */
				(aggregatedGroups) => Promise.all(aggregatedGroups.map((aggregatedGroup) => {
					if (!aggregatedGroup?.count) return Promise.resolve();
					if (aggregatedGroup.count < 2) return Promise.resolve();

					const uniqueSuffixes = aggregatedGroup.groupSuffix.filter(
						(suffix, index, array) => index === array.indexOf(suffix)
					);

					if (uniqueSuffixes.length === aggregatedGroup.groupSuffix.length)
						return Promise.resolve();

					return STUDY_GROUPS_COLLECTION.find({
						groupName: aggregatedGroup.groupName,
						groupSuffix: { $in: uniqueSuffixes }
					})
					.toArray()
					.then((foundGroups) => {
						const uniqueFoundGroups = foundGroups.filter((foundGroup, index, array) =>
							index === array.findIndex((matchingGroup) =>
								`${matchingGroup.groupName}${matchingGroup.groupSuffix || ""}` ===
								`${foundGroup.groupName}${foundGroup.groupSuffix || ""}`
							)
						);

						return STUDY_GROUPS_COLLECTION.deleteMany({
							groupName: aggregatedGroup.groupName,
							groupSuffix: { $in: uniqueSuffixes }
						})
						.then(() => STUDY_GROUPS_COLLECTION.insertMany(uniqueFoundGroups));
					})
					.catch((e) => {
						Logging(`While removing duplicates for ${aggregatedGroup.groupName}`, e);
						return Promise.resolve();
					});
				}))
			)
			.catch(() => {
				Logging(new Error("Couldn't remove duplicating groups"));
				return Promise.resolve();
			})
		)
		.then(() => PARAMS_COLLECTION.findOneAndUpdate(
			{ name: "scrapper_updated_date" },
			{ $set: {
				value: UPDATE_TIMESTAMP
			} }
		));
	});
})
.catch(Logging)
.finally(() => {
	mongoDispatcher.closeConnection();
	setTimeout(() => process.exit(0), DEV ? 0 : 10 * 1000);
});
