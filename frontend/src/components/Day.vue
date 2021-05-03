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
		<div class="day__title">{{ customTitle ? `${customTitle} – ${day.day}` : day.day }}</div>

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
					<div class="option__title">{{ option.name }}</div>
					<div class="option__info">
						<div class="option__info__item"><i class="material-icons material-icons-round default-no-selection">schedule</i>{{ lessonsTimes[dayIndex][lessonIndex] }}</div>

						<div class="option__info__item" v-if="option.place === 'Д' || option.place === 'д'"><i class="material-icons material-icons-round default-no-selection">alternate_email</i>
							<a v-if="option.link" :href="option.link" target="_blank" rel="noopener noreferrer">Дистанционно</a>
							<span v-else>Дистанционно</span>
						</div>
						<div class="option__info__item" v-else-if="option.place"><i class="material-icons material-icons-round default-no-selection">place</i>{{ option.place }}</div>

						<div class="option__info__item" v-if="option.tutor"><i class="material-icons material-icons-round default-no-selection">person</i>{{ option.tutor }}</div>

						<div class="option__info__item" v-if="option.type"><i class="material-icons material-icons-round default-no-selection">info</i>{{ option.type }}</div>

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

	width: 100%;
	margin: 0 0 20px;
	padding: 16px;
	box-sizing: border-box;

	background-color: var(--card-color);
	border-radius: 8px;
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);
}

@media (min-width: 900px) {
	.day {
		width: calc(50% - 12px);
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

	text-transform: uppercase;

	color: var(--card-accent-color);
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

	white-space: nowrap;
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