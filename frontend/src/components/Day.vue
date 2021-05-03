<template>
	<div
		:class="{
			'day': true,
			'day--one-line': oneLine
		}"
		v-if="
			(certainWeek < 0 ?
				day.odd.reduce((accum, lesson) => accum + lesson.length, 0) > 0 ||
				day.even.reduce((accum, lesson) => accum + lesson.length, 0) > 0
				:
				day[[ 'odd', 'even' ][ (certainWeek + 1) % 2 ]].reduce((accum, lesson) => accum + lesson.filter((option) =>
					!option.weeks || option.weeks.includes(certainWeek)
				).length, 0) > 0
			)
		"
	>
		<div class="day__title">
			<span class="day__title--uppercase">{{ customTitle || day.day }}</span>
			<span class="day__title--italic" v-if="customTitle">{{ day.day }}</span>
		</div>

		<div
			:class="{
				'oddity': true,
				[`oddity--${oddity}`]: true,
				'oddity--hidden':
									dayForCertrainWeek[oddity].reduce((accum, lesson) => accum + lesson.length, 0) === 0,
				'oddity--only-shown':
									dayForCertrainWeek[oddity].reduce((accum, lesson) => accum + lesson.length, 0) > 0 &&
									dayForCertrainWeek[
										[ 'odd', 'even' ][ ([ 'odd', 'even' ].indexOf(oddity) + 1) % 2 ]
									].reduce((accum, lesson) => accum + lesson.length, 0) === 0

									
			}"
			v-for="(oddity) in (certainWeek < 0 ? [ 'odd', 'even' ] : [[ 'odd', 'even' ][ (certainWeek + 1) % 2 ]])"
			:key="`day-${dayIndex}-${oddity}`"
		>
			<i class="oddity__title" v-if="(certainWeek < 0)">
				{{ { 'odd': "Нечётные", 'even': "Чётные" }[oddity] }}
			</i>
			<div
				v-for="(lesson, lessonIndex) in dayForCertrainWeek[oddity]"
				:key="`day-${dayIndex}-${oddity}-${lessonIndex}`"
				:class="{
					'lesson': true,
					'lesson--with-border': lesson.length &&
											dayForCertrainWeek[oddity].slice(lessonIndex + 1)
											.reduce((accum, value) => accum + value.length, 0) > 0
				}"
			>
				<div class="option" v-for="(option, optionIndex) in lesson" :key="`day-${dayIndex}-${oddity}-${lessonIndex}-${optionIndex}`">
					<div class="option__title">{{ lessonName(option.name) }}</div>
					<div class="option__info">
						<div :class="{
								'option__info__item': true,
								'option__info__item-time': true,
								'option__info__item-time--ongoing': showOngoingAndPlannedLesson && lessonStarted(lessonsTimes[dayIndex][lessonIndex]),
								'option__info__item-time--planned': showOngoingAndPlannedLesson && lessonPlanned(lessonsTimes[dayIndex][lessonIndex])
							}">
							<i class="material-icons material-icons-round default-no-selection">schedule</i>
							<span>{{ lessonsTimes[dayIndex][lessonIndex] }}</span>
							<i v-if="showOngoingAndPlannedLesson && lessonStarted(lessonsTimes[dayIndex][lessonIndex])">(сейчас)</i>
						</div>

						<div class="option__info__item" v-if="option.place === 'Д' || option.place === 'д'"><i class="material-icons material-icons-round default-no-selection">alternate_email</i>
							<a v-if="option.link" :href="option.link" target="_blank" rel="noopener noreferrer">Дистанционно</a>
							<span v-else>Дистанционно</span>
						</div>
						<div class="option__info__item" v-else-if="option.place"><i class="material-icons material-icons-round default-no-selection">place</i>{{ option.place }}</div>

						<div class="option__info__item" v-if="option.tutor"><i class="material-icons material-icons-round default-no-selection">person</i>{{ option.tutor }}</div>

						<div class="option__info__item" v-if="option.type"><i class="material-icons material-icons-round default-no-selection">info</i>{{ lessonType(option.type) }}</div>

						<div class="option__info__item" v-if="certainWeek < 0 && option.weeks && option.weeks.length"><i class="material-icons material-icons-round default-no-selection">date_range</i>
							<span>Недели: </span>
							<span
								:class="{
									'option__info__item__weeks': true,
									'option__info__item__weeks--passed': currentWeek > week	|| (currentWeek === week && dayIndex > new Date().getDay())
								}"
								v-for="(week, weekIndex) in option.weeks" :key="`day-${dayIndex}-${oddity}-${lessonIndex}-${optionIndex}-weeks-${week}`"
							>{{ week }}{{ weekIndex !== option.weeks.length - 1 ? ", " : "" }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "day",
	props: {
		day: Object,
		dayIndex: Number,
		lessonsTimes: Array,
		currentWeek: {
			type: Number,
			default: 0
		},
		customTitle: {
			type: String,
			default: ""
		},
		certainWeek: {
			type: Number,
			default: -1
		},
		oneLine: {
			type: Boolean,
			default: false
		},
		showOngoingAndPlannedLesson: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			/** @type {import("@/typings").DaySchedule} */
			dayForCertrainWeek: this.certainWeek < 0 ? this.day : {
				day: this.day.day,
				odd: this.day.odd.map(/** @param {import("@/typings").Lesson} lesson */ (lesson) =>
					lesson.filter((option) => !option.weeks || option.weeks.includes(this.certainWeek))
				),
				even: this.day.even.map(/** @param {import("@/typings").Lesson} lesson */ (lesson) =>
					lesson.filter((option) => !option.weeks || option.weeks.includes(this.certainWeek))
				)
			}
		}
	},
	methods: {
		/**
		 * @param {String} iLessonTime
		 * @returns {Boolean}
		 */
		lessonStarted: function (iLessonTime) {
			if (typeof iLessonTime !== "string") return false;

			const splitted = iLessonTime.split(/\s*[\-–—]\s*/)
			if (splitted.length < 2) return false;

			const splittedToTimeParts = splitted.map((time) => time.split(":").map((part) => parseInt(part)));
			if (splittedToTimeParts.filter((time) => time.some((part) => isNaN(part))).length) return false;

			const [ [startHours, startMinutes], [finishHours, finishMinutes] ] = splittedToTimeParts;

			const startTime = new Date();
				  startTime.setHours(startHours);
				  startTime.setMinutes(startMinutes);
				  startTime.setSeconds(0);
				  startTime.setMilliseconds(0);

			const finishTime = new Date();
				  finishTime.setHours(finishHours);
				  finishTime.setMinutes(finishMinutes);
				  finishTime.setSeconds(0);
				  finishTime.setMilliseconds(0);

			return startTime.getTime() <= Date.now() && finishTime.getTime() >= Date.now();
		},
		/**
		 * @param {String} iLessonTime
		 * @returns {Boolean}
		 */
		lessonPlanned: function (iLessonTime) {
			if (typeof iLessonTime !== "string") return false;

			const splitted = iLessonTime.split(/\s*[\-–—]\s*/)
			if (splitted.length < 2) return false;

			const splittedToTimeParts = splitted.map((time) => time.split(":").map((part) => parseInt(part)));
			if (splittedToTimeParts.filter((time) => time.some((part) => isNaN(part))).length) return false;

			const [ [startHours, startMinutes] ] = splittedToTimeParts;

			const startTime = new Date();
				  startTime.setHours(startHours);
				  startTime.setMinutes(startMinutes);
				  startTime.setSeconds(0);
				  startTime.setMilliseconds(0);

			return startTime.getTime() > Date.now();
		},
		/**
		 * @param {String} iType
		 * @returns {String}
		 */
		lessonType(iType) {
			if (typeof iType !== "string") return iType;

			switch (iType.trim().toLowerCase()) {
				case "пр": return "Семинар"; break;
				case "лк": return "Лекция"; break;
				case "лаб": return "Лабораторная"; break;
				case "ср":
				case "с/р": return "Сам. раб."; break;
				default: return iType; break;
			}
		},
		/**
		 * @param {String} iName
		 * @returns {String}
		 */
		lessonName(iName) {
			if (typeof iName !== "string") return iName;

			if (/^англ(ийский)?(\.)?\s*яз(ык)?(\.)?$/i.test(iName.trim())) return "Английский язык";
			if (/^фр(ан(ц(узский)?)?)?(\.)?\s*яз(ык)?(\.)?$/i.test(iName.trim())) return "Французский язык";
			if (/^ин(остранный)?(\.)?\s*яз(ык)?(\.)?$/i.test(iName.trim())) return "Иностранный язык";

			return iName;
		}
	}
}
</script>

<style scoped>
.day {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-content: flex-start;
	align-self: flex-start;
	flex-wrap: wrap;
	position: relative;

	width: calc(50% - 12px);
	margin: 0 0 20px;
	padding: 16px;
	box-sizing: border-box;

	background-color: var(--card-color);
	border-radius: 20px;
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);
}

@media (max-width: 432px) {
	.day {
		border-radius: 8px;
	}
}

@media (max-width: 800px) {
	.day {
		width: 100%;
	}
}

@media (min-width: 1600px) {
	.day {
		width: calc(100% / 3 - 12px);
	}
}

.day--one-line {
	margin: 0 auto 20px;
}

.day__title {
	display: block;
	position: relative;

	width: 100%;
	height: 20px;
	margin: 0;
	padding: 0;
	box-sizing: border-box;

	font-weight: 900;
	font-size: 20px;
	line-height: 1em;
	white-space: nowrap;

	color: var(--card-accent-color);
}

.day__title--italic {
	display: inline;
	font-style: italic;
	float: right;
}

.day__title--uppercase {
	text-transform: uppercase;
}

.oddity {
	display: block;
	position: relative;

	width: calc(50% - 8px);

	margin: 0;
	padding: 12px 0 0;
	box-sizing: border-box;

	overflow: hidden;
}

.oddity--hidden {
	display: none;
	width: 0;
}

.oddity--odd:last-of-type,
.oddity--even:nth-of-type(2),
.oddity--only-shown {
	width: 100%;
}

.oddity__title {
	display: block;
	position: relative;

	width: 100%;
	height: 32px;
	margin: 0;
	padding: 0 0 16px;
	box-sizing: border-box;

	font-weight: 700;
	font-size: 16px;
	line-height: 1em;
	white-space: nowrap;

	color: var(--text-color);
}

.lesson {
	display: block;
	position: relative;
}

.lesson--with-border {
	margin: 0 0 4px;
	padding: 0 0 8px;
	box-sizing: border-box;
	border-bottom: 1px solid var(--primary-color);
}

.option {
	display: block;
	position: relative;
}

.option:not(:last-of-type) {
	margin: 0 0 4px;
	padding: 0 0 2px;
	box-sizing: border-box;
	border-bottom: 1px dashed #DDD;
}

.option__title {
	font-size: 16px;
	font-weight: 700;

	margin: 0;
	padding: 0 0 4px;
	box-sizing: border-box;
}

.option__info__item {
	display: inline-block;
	position: relative;

	margin: 0 0 4px;
	padding: 0 6px 0 0;
	box-sizing: border-box;

	font-size: 14px;
	font-weight: 500;

	color: var(--text-color);
}

.option__info__item:last-of-type {
	padding: 0;
}

.option__info__item .material-icons {
	margin-right: 4px;

	font-size: 16px;
	vertical-align: -2.5px;

	color: var(--primary-color);
}

.option__info__item-time--planned {
	display: inline-block;
	position: relative;

	margin: 0 4px 4px 0;
	padding: 2px 4px;
	box-sizing: border-box;

	border-radius: 4px;

	background-color: var(--primary-color);
	color: #FFF;
}

.option__info__item-time--ongoing {
	display: inline-block;
	position: relative;

	margin: 0 4px 4px 0;
	padding: 2px 4px;
	box-sizing: border-box;

	border-radius: 4px;

	background-color: var(--accent-color);
	color: #FFF;
}

.option__info__item-time--planned .material-icons,
.option__info__item-time--ongoing .material-icons {
	color: inherit;
}

.option__info__item__weeks {
	display: inline-block;
	position: relative;

	font-weight: 500;
}

.option__info__item__weeks--passed {
	font-weight: 900;

	color: var(--primary-color);
}
</style>