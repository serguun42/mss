<template>
	<div
		:class="{
			'day': true,
			'day--one-line': oneLine,
			'day--in-masonry': inMasonry
		}"
		v-if="checkIfDayVisible()"
		:style="styles"
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
							<span data-nosnippet class="material-icons material-icons-round default-no-select">schedule</span>
							<span>{{ lessonsTimes[dayIndex][lessonIndex] }}</span>
							<span v-if="showOngoingAndPlannedLesson && lessonStarted(lessonsTimes[dayIndex][lessonIndex])">(сейчас)</span>
						</div>

						<div class="option__info__item" v-if="checkIfDistant(option)"><span data-nosnippet class="material-icons material-icons-round default-no-select">alternate_email</span>
							<a v-if="option.link" :href="option.link" target="_blank" rel="noopener noreferrer">Дистанционно</a>
							<span v-else>Дистанционно</span>
						</div>
						<div
							v-else-if="option.place"
							:class="{
								'option__info__item': true,
								'option__info__item--wavy default-pointer': checkForPlaceSearch(option.place)
							}"
							@click="searchForPlace(option.place)"
						>
							<span data-nosnippet class="material-icons material-icons-round default-no-select">place</span>
							{{ option.place }}
						</div>

						<div class="option__info__item" v-if="option.tutor"><span data-nosnippet class="material-icons material-icons-round default-no-select">person</span>{{ option.tutor }}</div>

						<div class="option__info__item" v-if="option.type"><span data-nosnippet class="material-icons material-icons-round default-no-select">info</span>{{ lessonType(option.type) }}</div>

						<div class="option__info__item" v-if="certainWeek < 0 && option.weeks && option.weeks.length"><span data-nosnippet class="material-icons material-icons-round default-no-select">date_range</span>
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
import CheckIfDayVisible from "../utils/check-if-day-visible";
import CheckIfDistant from "../utils/check-if-distant";
import LessonNameByType from "../utils/lesson-type";


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
		},
		inMasonry: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			/** @type {import("@/types").DaySchedule} */
			dayForCertrainWeek: this.certainWeek < 0 ? this.day : {
				day: this.day.day,
				odd: this.day.odd.map(/** @param {import("@/types").Lesson} lesson */ (lesson) =>
					lesson.filter((option) => !option.weeks || option.weeks.includes(this.certainWeek))
				),
				even: this.day.even.map(/** @param {import("@/types").Lesson} lesson */ (lesson) =>
					lesson.filter((option) => !option.weeks || option.weeks.includes(this.certainWeek))
				)
			},
			/** @type {CSSStyleDeclaration} */
			styles: null,
		}
	},
	methods: {
		/**
		 * @param {string} iLessonTime
		 * @returns {Boolean}
		 */
		lessonStarted(iLessonTime) {
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
		 * @param {string} iLessonTime
		 * @returns {boolean}
		 */
		lessonPlanned(iLessonTime) {
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
		 * @param {string} iType
		 * @returns {string}
		 */
		lessonType(iType) {
			return LessonNameByType(iType);
		},
		/**
		 * @param {string} iName
		 * @returns {string}
		 */
		lessonName(iName) {
			if (typeof iName !== "string") return iName;

			if (/^англ(ийский)?(\.)?\s*яз(ык)?(\.)?$/i.test(iName.trim())) return "Английский язык";
			if (/^фр(ан(ц(узский)?)?)?(\.)?\s*яз(ык)?(\.)?$/i.test(iName.trim())) return "Французский язык";
			if (/^ин(остранный)?(\.)?\s*яз(ык)?(\.)?$/i.test(iName.trim())) return "Иностранный язык";

			return iName;
		},
		/**
		 * @returns {boolean}
		 */
		checkIfDayVisible() {
			return CheckIfDayVisible(this.certainWeek, this.day);
		},
		/**
		 * @param {import("../types").Option} iOption
		 * @returns {string}
		 */
		checkIfDistant(iOption) {
			return CheckIfDistant(iOption);
		},
		/**
		 * @param {CSSStyleDeclaration} styles
		 */
		saveStyle(styles) {
			this.styles = styles;
		},
		/**
		 * @param {string} place
		 */
		checkForPlaceSearch(place) {
			return typeof place === "string" && place.includes("(В-78)");
		},
		/**
		 * @param {string} place
		 */
		searchForPlace(place) {
			if (!this.checkForPlaceSearch(place)) return;

			const seekingRoom = place.replace("(В-78)", "").trim();
			if (!seekingRoom) return;

			this.$router.push({ path: "/scheme", query: { seekingRoom } });
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

@media (min-width: 1500px) {
	.day {
		width: calc(100% / 3 - 12px);
	}
}

.day--one-line {
	margin: 0 auto 20px;
}

.day--in-masonry {
	position: absolute;
	margin: 0;
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

	color: var(--dark-color);
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

.option__info__item--wavy:after {
	display: block;
	position: absolute;
	content: "";

	width: 100%;
	height: 1px;
	border-bottom: 1px dashed var(--primary-color);
}

.option__info__item__weeks {
	display: inline-block;
	position: relative;

	font-weight: 500;
}

.option__info__item__weeks--passed {
	font-weight: 900;

	color: var(--dark-color);
}
</style>