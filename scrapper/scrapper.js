const
	fs = require("fs"),
	util = require("util"),
	fsWriteFile = util.promisify(fs.writeFile),
	xlsx = require("node-xlsx").default,
	NodeFetch = require("node-fetch"),
	ParseHTML = require("node-html-parser").parse,


	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	{
		DATABASE_NAME,
		DAYS_OF_WEEK,
		SCHEDULE_LINK,
		INDEX_OF_LINE_WITH_GROUPS_NAMES,
	} = DEV ? require("../../DEV_CONFIGS/scrapper.config.json") : require("./scrapper.config.json"),
	FIXES = require("./scrapper.fixes.json"),


	MongoDispatcher = require("./scrapper.database.js"),
	mongoDispatcher = new MongoDispatcher(DATABASE_NAME),


	Logging = require("./scrapper.logging.js");



/** @typedef {import("node-html-parser").HTMLElement} NPHE */
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
 * @property {Date} updatedDate
 * @property {String[][]} lessonsTimes
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
 * @param {Number[]} iArray
 * @param {Number} iPos
 * @returns {Number}
 */
const GlobalReduceArrayToIndex = (iArray, iPos) => iArray.reduce((accum, current, index) => index >= iPos ? accum : accum + current, 0);

/**
 * @param {String} iRawComplexLesson
 * @returns {String[] | null}
 */
const ParseLessonPartsAndOptions = iRawComplexLesson => {
	if (!iRawComplexLesson) return null;
	if (typeof iRawComplexLesson !== "string") return null;

	Object.keys(FIXES).forEach((regexpRaw) => {
		iRawComplexLesson = iRawComplexLesson.replace(new RegExp(regexpRaw, "g"), FIXES[regexpRaw]);
	});
	
	return iRawComplexLesson.replace(/\r/g, "").split("\n").filter(i => !!i);
};

/**
 * @typedef {Object} XLSXFileDefinition
 * @property {String} remoteFile
 * @property {String} unitName
 * @property {String} unitCourse
 */
/**
 * @typedef {Object} XLSXFileData
 * @property {String} remoteFile
 * @property {Buffer} fileData
 * @property {String} unitName
 * @property {String} unitCourse
 */
/**
 * @returns {Promise.<XLSXFileDefinition[], Error>}
 */
const GetLinkToFiles = () => new Promise((resolve, reject) => {
	NodeFetch(SCHEDULE_LINK, {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "en-US,en;q=0.9,ru;q=0.8",
			"cache-control": "max-age=0",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1"
		},
	}).then((res) => {
		if (res.status === 200)
			return res.text();
		else
			return Promise.reject(res.status);
	}).then(/** @param {String} page */ (page) => {
		if (DEV) fsWriteFile("./out/mirea-ru-schedule.html", page).catch(() => {});


		const allXLSXDefinitionsToResolve = [],
			  parsedPage = ParseHTML(page, { lowerCaseTagName: true }),
			  UNITS_NAMES = parsedPage.querySelectorAll(".rasspisanie .uk-active a").map((anchor) => anchor.innerText),
			  UNITS_HTML_BLOCKS = parsedPage.querySelector(".uk-switcher").childNodes.filter((child) => child.nodeType === 1);


		UNITS_HTML_BLOCKS.forEach(/** @param {NPHE} unitHTMLBlock */ (unitHTMLBlock, unitIndex) => {
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
					};

					let lastCourseExec;
					while (lastCourseExec = XLSX_FILES_COURSE_REGEXP.exec(usualTableCardsLayout)) {
						subInstituteCourses.push(lastCourseExec[XLSX_FILES_COURSE_REGEXP_GROUP_INDEX]?.trim());
					};


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


	if (DEV) iXLSXFileDefinitions = iXLSXFileDefinitions.slice(0, 2);


	/** @type {XLSXFileData[]} */
	const allXLSXFilesData = [];


	const LocalRecurion = (iIndex) => {
		const gettingFileProps = iXLSXFileDefinitions[iIndex];

		if (!gettingFileProps)
			return resolve(allXLSXFilesData);


		if (DEV) Logging(`Getting file ${encodeURI(gettingFileProps.remoteFile)}`);

		NodeFetch(encodeURI(gettingFileProps.remoteFile)).then((res) => {
			if (res.status === 200)
				return res.buffer();
			else
				return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
		}).then(/** @param {Buffer} fileData */ (fileData) => {
			allXLSXFilesData.push({
				fileData,
				...gettingFileProps
			});

			if (DEV) fsWriteFile(`./data/${gettingFileProps.remoteFile.replace("https://webservices.mirea.ru/upload/iblock", "").replace(/[^\wа-я]/gi, "_")}`, fileData).catch(() => {});
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
	iXLSXFilesData.forEach((XLSXFileData) => {
		const workSheetsFromFile = xlsx.parse(XLSXFileData.fileData);
		const tableSheet = workSheetsFromFile[0];

		const tableData = tableSheet.data;
		if (!tableData) return;


		const lineWithGroups = tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES];
		if (!(lineWithGroups instanceof Array)) return reject(`No groups in the sheet`);


		const indexesOfCellsWithGroupNames = lineWithGroups.map((cell, index) => {
			if (typeof cell !== "string") return null;

			if (/^[\wа-я]{4}-\d{2}-\d{2}/i.test(cell?.trim?.()))
				return index;
			else
				return null;
		}).filter((index) => index !== null);


		let finalRowIndex = INDEX_OF_LINE_WITH_GROUPS_NAMES + 2 + 72;

		tableData.forEach((row, rowIndex) => {
			if (/Начальник\s+УМУ/gi.test(row[2])) finalRowIndex = rowIndex;
		});


		/** @type {Number[]} */
		const daysByLessonsNumber = new Array(6).fill(0);

		let currentDay = -1;
		tableData
			.slice(INDEX_OF_LINE_WITH_GROUPS_NAMES + 2, finalRowIndex)
			.forEach((row) => {
				if (row[0]) ++currentDay;
				
				++daysByLessonsNumber[currentDay];
			});


		/** @type {String[][]} */
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

			/** @type {String} */
			const certainGroupName = tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup]
				?.replace?.(/\r|\n/g, "")
				?.replace?.(/^([\wа-я]{4}-\d{2}-\d{2}).*$/i, "$1")
				?.trim?.();
			/** @type {String} */
			const certainGroupSuffix = (
				tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup + 1] || 
				tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup + 2] || 
				tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup + 3]
			)
				?.replace?.(/\r|\n/g, "")
				||
				tableData[INDEX_OF_LINE_WITH_GROUPS_NAMES][indexOfCertainGroup]
					?.replace?.(/\r|\n/g, "")
					?.replace?.(/^[\wа-я]{4}-\d{2}-\d{2}(.*)$/i, "$1")
					?.replace?.(/\(|\)/g, "")
					?.trim?.();


			/** @type {Schedule} */
			const schedule = [];

			certainGroupTable.forEach((lessonOption, lessonOptionIndex) => {
				let dayOfWeek = 0;
				
				while (GlobalReduceArrayToIndex(daysByLessonsNumber, dayOfWeek + 1) <= lessonOptionIndex) {
					++dayOfWeek;
				};

				if (!schedule[dayOfWeek]) schedule[dayOfWeek] = {
					day: DAYS_OF_WEEK[dayOfWeek],
					odd: [],
					even: []
				};


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
						let weeks = optionName.match(/^([\d\,]+)\s?н\.?\s/);
						if (weeks && weeks[1])
							weeks = weeks[1];
						else
							weeks = null;

						if (!weeks) {
							weeks = optionName.match(/^((\d+)\-(\d+))\s?н\.?\s/);

							if (weeks && weeks[1] && weeks[2] && weeks[3]) {
								let weeksArr = [],
									startingWeek = parseInt(weeks[2]),
									endingWeek = parseInt(weeks[3]);

								for (let i = startingWeek; i <= endingWeek; i += 2)
									weeksArr.push(i);

								weeks = weeksArr.join(",");
							} else
								weeks = null;
						};

						formedLesson.push({
							weeks: weeks ? weeks.split(",").map(week => +week) : null,
							name: weeks ? optionName.replace(/^([\d\,]+)\s?н\.?\s/, "").replace(/^((\d+)\-(\d+))\s?н\.?\s/, "").trim() : optionName.trim(),
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
	});

	resolve(GLOBAL_SCHEDULE);
});


GetLinkToFiles()
.then((allLinksToXLSXFiles) => GetTablesFiles(allLinksToXLSXFiles))
.then((allXLSXFilesData) => BuildGlobalSchedule(allXLSXFilesData))
.then(() => {
	if (DEV) {
		Logging("Got all files. Go see ./out/global-schedule.json");
		fsWriteFile("./out/global-schedule.json", JSON.stringify(GLOBAL_SCHEDULE, false, "\t"));
	};

	return mongoDispatcher.callDB()
	.then((DB) => {
		const COLL = DB.collection("study-groups");

		return COLL.insertMany(GLOBAL_SCHEDULE)
		.then(() => new Promise((resolveClearingPrevious) => {
			/**
			 * @param {Number} iIndex
			 */
			const LocalRecurionRemove = iIndex => {
				const studyGroupProps = GLOBAL_SCHEDULE[iIndex];
				if (!studyGroupProps) return resolveClearingPrevious();

				COLL.findOneAndDelete({
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
		.then(() => {
			Logging(`Successfully done inserting study groups.`);
			mongoDispatcher.closeConnection();
		});
	});
})
.catch((e) => {
	Logging(e);
	mongoDispatcher.closeConnection();
});
