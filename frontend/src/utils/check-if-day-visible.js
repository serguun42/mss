/**
 * @param {number} certainWeek
 * @param {import("../types").DaySchedule} day
 * @returns {boolean}
 */
const CheckIfDayVisible = (certainWeek, day) =>
	!!(certainWeek < 0
		? day.odd.reduce((accum, lesson) => accum + lesson.length, 0) ||
		  day.even.reduce((accum, lesson) => accum + lesson.length, 0)
		: day[["odd", "even"][(certainWeek + 1) % 2]].reduce(
				(accum, lesson) =>
					accum + lesson.filter((option) => !option.weeks || option.weeks.includes(certainWeek)).length,
				0
		  ));

export default CheckIfDayVisible;
