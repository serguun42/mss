import ical from "ical-generator";
import router from "../router";
import store from "../store";
import { GetGroupsByNameAndSuffix, GetTimeStart } from "./api";

/** @typedef {import("ical-generator").ICalEvent | import("ical-generator").ICalEventData} CalEvent */
/** Let's pretend every semester has only 17 weeks in it (precisely) */
const TOTAL_WEEKS_COUNT = 17;
const CALENDAR_MIME_TYPE = "text/calendar";
const CALENDAR_FILE_TYPE = ".ics";
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

/**
 * @param {string} type
 * @returns {string}
 */
const LessonNameByType = (type) => {
	if (typeof type !== "string") return "";

	switch (type.trim().toLowerCase()) {
		case "пр": return "Семинар"; break;
		case "лк": return "Лекция"; break;
		case "лаб": return "Лабораторная"; break;
		case "ср":
		case "с/р": return "Сам. раб."; break;
		default: return type; break;
	}
}

/**
 * Collects data, builds and downloads .ICS file
 * @returns {void}
 */
export const ExportToIcs = () => {
	const groupName = store.getters.userGroup?.name;
	const groupSuffix = store.getters.userGroup?.suffix;

	if (!groupName) {
		store.dispatch("showMessage", "Установите группу для экспорта");
		router.push({ path: "/" });
		return;
	}

	const calendarName = `Расписание группы ${groupName}${groupSuffix ? ` (${groupSuffix})` : ''}`;
	const calendar = ical({
		name: calendarName,
		prodId: "//mirea.xyz//MSS//RU"
	});

	GetGroupsByNameAndSuffix(groupName, groupSuffix)
	.then((foundGroups) => GetTimeStart()
	.then((timeStart) => {
		const group = foundGroups[0];
		if (!group) return store.dispatch("showMessage", "Группа не найдена");

		Array.from({ length: TOTAL_WEEKS_COUNT }, (_, weekIndex) =>
			group.schedule.map((daySchedule, dayIndex) => {
				/** @type {import("../types").Lesson[]} */
				const dayVersion = (weekIndex % 2 === 0 ? daySchedule.odd : daySchedule.even);

				return dayVersion.map((lesson, lessonIndex) => {
					/** @type {[number, number, number, number]} */
					const lessonTimes = group.lessonsTimes[dayIndex][lessonIndex]
										.split(/(?:(?:\s.\s|:))/)
										.map((part) => parseInt(part));
					const lessonDayDate = new Date(timeStart.getTime() + weekIndex * WEEK + dayIndex * DAY);
					const lessonStartDate = new Date(lessonDayDate);
					lessonStartDate.setHours(lessonTimes[0]);
					lessonStartDate.setMinutes(lessonTimes[1]);
					const lessonEndDate = new Date(lessonDayDate);
					lessonEndDate.setHours(lessonTimes[2]);
					lessonEndDate.setMinutes(lessonTimes[3]);

					if (lessonEndDate.getTime() < Date.now()) return;

					return lesson.map((option) => {
						if (!option.weeks || option.weeks.includes(weekIndex + 1)) {
							calendar.createEvent({
								start: lessonStartDate,
								end: lessonEndDate,
								summary: option.name + (option.type ? ` (${option.type})` : ''),
								location: option.place === "Д" || option.place === "д" ? "Дистанционно" : option.place,
								url: option.link || undefined,
								description: (option.tutor || option.type) ? `${
									option.tutor ? `Преподаватель: ${option.tutor}` : ""
								}${option.tutor && option.type ? " " : ""}${LessonNameByType(option.type)}` : ""
							});
						}
					});
				});
			})
		);

		const stringifiedCalendar = calendar.toString();
		const calendarBlob = new Blob([stringifiedCalendar], {
			type: CALENDAR_MIME_TYPE
		});
		const blobUrl = URL.createObjectURL(calendarBlob);

		const downloadLink = document.createElement("a");
		downloadLink.setAttribute("href", blobUrl);
		downloadLink.setAttribute("download", `${calendarName}${CALENDAR_FILE_TYPE}`);
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();

		store.dispatch("showMessage", "Расписание до конца семестра 💾");
	}))
	.catch(console.warn);
};
