<template>
	<div class="week-switch" v-if="currentWeek > 0 || selectedWeek">
		<div class="week-switch__title default-no-select default-pointer" @click="showPopup">
			<span v-if="!selectedWeek">Текущая неделя – {{ currentWeek }}</span>
			<span v-else>Выбранная неделя – {{ selectedWeek }}</span>
			<span class="week-switch__icon material-icons material-icons-round">expand_more</span>
		</div>

		<div class="week-switch__popup default-no-select" ref="popup">
			<div class="week-switch__popup-obfuscator default-pointer" @click="closePopup"></div>
			<div class="week-switch__popup-body">
				<div class="week-switch__popup__title">Выбрать неделю</div>
				<div class="week-switch__popup__weeks">
					<div
						:class="{
							'week-switch__popup__week default-pointer': true,
							'week-switch__popup__week--current': week === currentWeek,
							'week-switch__popup__week--selected': week === selectedWeek
						}"
						v-for="week in weeks"
						:key="week"
						v-text="week"
						@click="onWeekClick(week)"
					></div>
				</div>
				<div
					:class="{
						'week-switch__popup__cancel': true,
						'week-switch__popup__cancel--disabled': !selectedWeek,
						'default-pointer': selectedWeek
					}"
					@click="onCancelClick"
				>
					Сбросить выбор
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { GetCurrentWeek, GetTimeStart } from "@/utils/api";
import { FadeIn, FadeOut } from "@/utils/animation";
import ANIMATIONS_CONFIG from "@/config/animations.json";

export default {
	name: "week-switch",
	props: {
		preselectedWeek: {
			type: Number,
			required: false
		}
	},
	data() {
		return {
			currentWeek: 0,
			selectedWeek: this.preselectedWeek || this.knownCurrenWeek || 0,
			/** @type {number[]} */
			weeks: []
		};
	},
	created() {
		if (!this.currentWeek)
			GetCurrentWeek()
				.then((currentWeek) => {
					this.currentWeek = currentWeek;
				})
				.catch(console.warn);

		if (!this.weeks?.length)
			GetTimeStart()
				.then((startDate) => {
					const startMonth = startDate.getMonth();
					const endDate =
						startMonth === 7 || startMonth === 8
							? new Date(startDate.getFullYear(), 11, 24)
							: new Date(startDate.getFullYear(), 5, 6);

					const weekGap = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
					this.weeks = Array.from({ length: weekGap }, (_, index) => index + 1);
				})
				.catch(console.warn);
	},
	methods: {
		showPopup() {
			if (!this.$refs["popup"]) return;
			FadeIn(this.$refs["popup"], ANIMATIONS_CONFIG.WEEK_CHOICE_POPUP_FADE_MS, { display: "block" });
		},
		closePopup() {
			if (!this.$refs["popup"]) return;
			FadeOut(this.$refs["popup"], ANIMATIONS_CONFIG.WEEK_CHOICE_POPUP_FADE_MS);
		},
		/**
		 * @param {number} week
		 */
		onWeekClick(week) {
			this.selectedWeek = week;
			this.closePopup();
			this.$emit("weekSelected", week);
		},
		onCancelClick() {
			if (this.selectedWeek) this.onWeekClick(0);
		}
	}
};
</script>

<style scoped>
.week-switch {
	display: block;
	position: relative;

	width: calc(100% - 32px);
	max-width: 400px;
	height: 40px;

	margin: 0 auto;
	padding: 0;
	box-sizing: border-box;

	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);
	border-radius: 20px;

	background-color: var(--navigation-background-color);
}

.week-switch__title {
	display: block;
	position: relative;

	width: 100%;
	height: 40px;

	margin: 0;
	padding: 6px 16px;
	box-sizing: border-box;

	font-weight: 700;
	font-size: 20px;
	line-height: 28px;
	text-align: center;

	color: var(--navigation-text-color);
}

.week-switch__icon {
	display: block;
	position: absolute;

	top: 8px;
	right: 12px;
}

.week-switch__popup {
	display: none;
	position: fixed;

	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;

	z-index: 8;
}

.week-switch__popup-obfuscator {
	display: block;
	position: absolute;

	width: 100%;
	height: 100%;
	top: 0;
	left: 0;

	background-color: var(--background-color);
	opacity: 0.5;
}

.week-switch__popup-body {
	display: block;
	position: absolute;

	width: 300px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);

	padding: 12px 16px;
	box-sizing: border-box;

	background-color: var(--card-color);
	border-radius: 10px;
}

@media (max-width: 800px) {
	.week-switch__popup-body {
		width: calc(100% - 32px);
		bottom: 16px;
		left: 16px;

		top: unset;
		transform: unset;
	}
}

.week-switch__popup__title {
	display: block;
	position: relative;

	width: 100%;
	margin-bottom: 12px;

	font-weight: 700;
	font-size: 20px;
	line-height: 28px;
	text-align: center;
}

.week-switch__popup__weeks {
	display: grid;
	grid-template-columns: repeat(4, 60px);
	gap: 8px 8px;
	position: relative;

	width: calc(60px * 4 + 8px * 3);

	margin: 0 auto;
	padding: 0;
	box-sizing: border-box;
}

.week-switch__popup__week {
	display: block;
	position: relative;

	width: 60px;
	height: 40px;

	margin: 0;
	padding: 10px 0;
	box-sizing: border-box;

	font-weight: 400;
	font-size: 16px;
	line-height: 20px;
	text-align: center;

	border-radius: 4px;
	background-color: transparent;
}

.week-switch__popup__week--current {
	font-weight: 700;
	color: #FFF;
	background-color: var(--primary-color);
}

.week-switch__popup__week--selected {
	font-weight: 700;
	color: #FFF;
	background-color: var(--accent-color);
}

.week-switch__popup__cancel {
	display: block;
	position: relative;

	width: 100%;

	margin-top: 20px;

	font-weight: 500;
	font-size: 16px;
	line-height: 20px;
	text-align: center;
}

.week-switch__popup__cancel--disabled {
	color: #888;
	opacity: 0.5;
}
</style>
