<template>
	<div id="single-group-page" :key="myGroupRequested">
		<div id="single-group-page__title" class="default-no-selection">
			<div id="single-group-page__title__name">{{ myGroupRequested ? $store.getters.userGroup && $store.getters.userGroup.name : name }}</div>
			<div id="single-group-page__title__suffix" v-if="myGroupRequested ? $store.getters.userGroup && $store.getters.userGroup.suffix : suffix">{{ myGroupRequested ? $store.getters.userGroup && $store.getters.userGroup.suffix : suffix }}</div>
			<div id="single-group-page__title__your-group-badge" v-if="myGroupRequested">Моя группа</div>
			<div id="single-group-page__title__your-group-badge" class="single-group-page__title__your-group-badge--altered default-pointer" v-else @click="saveGroup">Запомнить группу</div>

			<div id="single-group-page__title__additional-info">
				<div class="single-group-page__title__additional-info__item" v-if="apiData && apiData.unitName">{{ apiData.unitName }}</div>
				<div class="single-group-page__title__additional-info__item" v-if="apiData && apiData.unitCourse">{{ apiData.unitCourse }}</div>
				<div class="single-group-page__title__additional-info__item" v-if="updateDate">Обновлено {{ updateDate }}</div>
				<div class="single-group-page__title__additional-info__item" v-if="apiData && apiData.remoteFile">
					<a :href="apiData.remoteFile" target="_blank" rel="noopener noreferrer">
						<i class="material-icons material-icons-round">file_download</i>
						<span>.XSLX-файл</span>
					</a>
				</div>
			</div>
		</div>

		<div id="single-group-page__current-week" v-if="currentWeek">Текущая неделя – {{ currentWeek }}</div>

		<div id="single-group-page__days" v-if="apiData && apiData.schedule">
			<day
				v-for="(day, dayIndex) in apiData.schedule"
				:key="`day-${dayIndex}`"
				:day="day"
				:dayIndex="dayIndex"
				:lessonsTimes="apiData.lessonsTimes"
				:currentWeek="currentWeek"
			></day>
		</div>
	</div>
</template>

<script>
import store from "@/store";
import Dispatcher from "@/utils/dispatcher";
import { GetCurrentWeek, GetGroupsByNameAndSuffix } from "@/utils/api";
import Day from "@/components/Day.vue";
import router from "@/router";

export default {
  components: { Day },
	name: "single-group-page",
	props: {
		name: String,
		suffix: String
	},
	computed: {
		/** @returns {string | null} */
		updateDate() {
			if (!this.apiData) return null;
			if (!this.apiData.updatedDate) return null;

			const parsedUpdatedDate = new Date(this.apiData.updatedDate);
			if (isNaN(parsedUpdatedDate.getTime())) return null;

			if (Math.floor((parsedUpdatedDate.getTime() - new Date().getTimezoneOffset() * 60e3) / 86400e3) === Math.floor((Date.now() - new Date().getTimezoneOffset() * 60e3) / 86400e3))
				return `сегодня, ${parsedUpdatedDate.getHours()}:${parsedUpdatedDate.getMinutes().toString().padStart(2, "0")}`;
			
			if (Math.floor((parsedUpdatedDate.getTime() - new Date().getTimezoneOffset() * 60e3) / 86400e3) === Math.floor((Date.now() - new Date().getTimezoneOffset() * 60e3) / 86400e3) - 1)
				return `вчера, ${parsedUpdatedDate.getHours()}:${parsedUpdatedDate.getMinutes().toString().padStart(2, "0")}`;

			return `${parsedUpdatedDate.toLocaleDateString()}, ${parsedUpdatedDate.getHours()}:${parsedUpdatedDate.getMinutes().toString().padStart(2, "0")}`;
		}
	},
	data() {
		return {
			myGroupRequested: store.getters.userGroup?.name && (!this.name || store.getters.userGroup?.name === this.name),
			/** @type {import("../types").RichGroup} */
			apiData: {},
			currentWeek: 0
		}
	},
	watch: {
		name(newName, oldName) {
			if (newName !== oldName)
				Dispatcher.call("groupViewPropsChanged");
		}
	},
	created() {
		Dispatcher.call("preload");

		this.onload();
		Dispatcher.link("groupViewPropsChanged", this.onload);


		Dispatcher.link("userGroupUpdated", () => {
			this.myGroupRequested = !!store.getters.userGroup?.name && (!this.name || store.getters.userGroup?.name === this.name);
		});
	},

	beforeDestroy() {
		Dispatcher.unlink("groupViewPropsChanged", this.onload);
	},

	methods: {
		saveGroup() {
			store.dispatch("saveGroup", { name: this.name || store.getters.userGroup?.name, suffix: this.suffix || store.getters.userGroup?.suffix || "", noReload: true });
		},
		onload() {
			if (!this.name && !store.getters.userGroup?.name) {
				Dispatcher.unlink("groupViewPropsChanged", this.onload);
				return router.push({ path: "/" });
			}

			GetGroupsByNameAndSuffix(
				this.myGroupRequested ? store.getters.userGroup?.name : this.name,
				this.myGroupRequested ? store.getters.userGroup?.suffix : this.suffix || ""
			)
			.then((group) => {
				this.apiData = group[0];

				return GetCurrentWeek();
			})
			.then((week) => this.currentWeek = week)
			.catch(console.warn)
			.finally(() => Dispatcher.call("preloadingDone"));
		}
	}
}
</script>

<style scoped>
#single-group-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

#single-group-page__title {
	display: block;
	position: relative;
	
	width: 100%;

	margin: 0;
	padding: 32px;
	box-sizing: border-box;
	
	text-align: center;
}

#single-group-page__title__name {
	display: block;
	position: relative;

	font-size: 32px;
	font-weight: 700;
	line-height: 32px;
	white-space: nowrap;
	color: var(--primary-color);
}

#single-group-page__title__suffix {
	display: inline-block;
	position: relative;

	margin: 0;
	padding: 8px 8px 0;
	box-sizing: border-box;

	font-size: 20px;
	font-weight: 500;
	line-height: 24px;
	color: var(--group-page-faded-title);
}

#single-group-page__title__additional-info {
	display: block;
	position: relative;

	margin: 0;
	padding: 6px 0 0;
	box-sizing: border-box;

	font-size: 16px;
	font-weight: 500;
	line-height: 20px;
	color: var(--group-page-faded-title);
}

.single-group-page__title__additional-info__item {
	display: inline-block;
	position: relative;

	margin: 0;
	padding: 2px 0 0;
	box-sizing: border-box;
}

.single-group-page__title__additional-info__item .material-icons {
	margin-right: 4px;
	font-size: 16px;
	vertical-align: -4px;
}

.single-group-page__title__additional-info__item:not(:last-of-type)::after {
	display: inline-block;
	position: relative;

	content: "•";

	margin: 0;
	padding: 0 4px 0;
	box-sizing: border-box;
}

.single-group-page__title__additional-info__item a {
	font-weight: 700;
	text-decoration: none;
}

#single-group-page__title__your-group-badge {
	display: inline-block;
	position: relative;

	height: 24px;
	margin: 8px 0 0 0;
	padding: 0 8px;
	box-sizing: border-box;

	font-size: 16px;
	font-weight: 500;
	line-height: 24px;
	white-space: nowrap;
	vertical-align: 1px;

	color: #FFF;
	background-color: var(--primary-color);
	border-radius: 4px;
}

#single-group-page__title__your-group-badge:not(:only-child) {
	margin-left: 12px;
}

.single-group-page__title__your-group-badge--altered {
	color: var(--primary-color);
	background-color: #FFF;
}

#single-group-page__current-week {
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

	background-color: var(--navigation-background-color);
	color: var(--navigation-text-color);

	font-weight: 700;
	font-size: 20px;
	line-height: 28px;
	text-align: center;
}

#single-group-page__days {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	flex-wrap: wrap;
	position: relative;

	width: 100%;
	max-width: 1600px;
	margin: 0 auto;
	padding: 32px 16px;
	box-sizing: border-box;
}
</style>