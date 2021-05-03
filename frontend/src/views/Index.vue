<template>
	<div id="index-page">
		<h1 class="index-page__header">Расписание МИРЭА</h1>
		<div id="index-page__current-week" v-if="currentWeek">Текущая неделя – {{ currentWeek }}</div>

		<div id="index-page__group" v-if="savedUserGroup && savedUserGroup.schedule">
			<h1 id="index-page__group__title">Группа {{ savedUserGroup.groupName }}</h1>
			<div id="index-page__group__days" v-if="savedUserGroupDays.length">
				<day
					v-for="(day, dayIndex) in savedUserGroupDays"
					:key="`day-${dayIndex}`"
					:day="day"
					:dayIndex="dayIndex"
					:lessonsTimes="savedUserGroup.lessonsTimes"
					:customTitle="day.customTitle"
					:certainWeek="day.certainWeek || -1"
					:oneLine="true"
				></day>
			</div>
			<pre v-else>no days</pre>
		</div>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
import { GetCurrentWeek, GetGroupsByName, GetGroupsByNameAndSuffix } from "@/utils/api";
import store from "@/store";
import Day from "@/components/Day";

/** @typedef {import("@/typings").DaySchedule & {certainWeek: number, customTitle: string}} CustomDay */

export default {
	name: "index-page",
	components: {
		Day,
	},
	data() {
		return {
			/** @type {import("@/typings").RichGroup} */
			savedUserGroup: {},
			/** @type {CustomDay[]} */
			savedUserGroupDays: [],
			currentWeek: 0
		}
	},
	created() {
		Dispatcher.call("preload");

		GetCurrentWeek()
		.then((weekFromApi) => {
			this.currentWeek = weekFromApi;

			if (store.getters.userGroup?.name) {
				return (
					store.getters.userGroup?.suffix ?
						GetGroupsByName(store.getters.userGroup?.name)
						:
						GetGroupsByNameAndSuffix(store.getters.userGroup?.name, store.getters.userGroup?.suffix)
				).then((groups) => {
					if (!(groups && groups[0]))
						return Promise.reject("No groups!");

					this.savedUserGroup = groups[0];

					/** @type {CustomDay} */
					const today = this.savedUserGroup.schedule[new Date().getDay() - 1 < 0 ? 7 + (new Date().getDay() - 1) : new Date().getDay() - 1];
					today.customTitle = "Сегодня";
					today.certainWeek = this.currentWeek;

					/** @type {CustomDay} */
					const tomorrow = this.savedUserGroup.schedule[new Date().getDay() % 7];
					tomorrow.customTitle = "Завтра";
					tomorrow.certainWeek = this.currentWeek + (new Date().getDay() === 0);

					this.savedUserGroupDays = [
						today, tomorrow
					].filter((day) => !!day);
				})
				.catch(console.warn)
			} else {
				return;
			}
		})
		.catch(console.warn)
		.finally(() => Dispatcher.call("preloadingDone"));
	}
}
</script>

<style scoped>
#index-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

.index-page__header {
	text-align: center;
}

h3.index-page__header {
	color: var(--index-page-faded-title);
}

#index-page__current-week {
	display: block;
	position: relative;

	width: calc(100% - 32px);
	max-width: 400px;
	height: 40px;

	margin: 0 auto;
	padding: 6px 16px;
	box-sizing: border-box;

	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);
	border-radius: 20px;

	background-color: var(--navigation-color);
	color: var(--primary-color);

	font-weight: 700;
	font-size: 20px;
	line-height: 28px;
	text-align: center;
}

#index-page__group {
	display: block;
	position: relative;

	margin: 0;
	padding: 32px 0 16px;
	box-sizing: border-box;
}

#index-page__group__title {
	display: block;
	position: relative;

	font-size: 32px;
	font-weight: 700;
	line-height: 32px;
	white-space: nowrap;
	color: var(--primary-color);

	text-align: center;
}

#index-page__group__days {
	display: block;
	position: relative;

	width: 100%;
	margin: 0 auto;
	padding: 32px 16px;
	box-sizing: border-box;
}
</style>