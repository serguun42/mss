<template>
	<div id="index-page">
		<div id="index-page__group" v-if="savedUserGroup && savedUserGroup.schedule">
			<h1 class="index-page__title index-page__group__title">Группа {{ savedUserGroup.groupName }}</h1>
			<h3 class="index-page__subtitle default-no-select">Расписание МИРЭА – MSS Project</h3>
			<week-switch @weekSelected="onWeekSelected" />

			<preview />

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
					:showOngoingAndPlannedLesson="day.showOngoingAndPlannedLesson"
				></day>
			</div>
			<h2 class="index-page__no-lessons-in-days" v-else>
				<p>
					Нет пар в ближайшие дни –
					<router-link to="/group">расписание&nbsp;на&nbsp;все&nbsp;недели</router-link>
				</p>
			</h2>
		</div>

		<div v-else-if="loadedOnce">
			<h1 class="index-page__header">Расписание МИРЭА</h1>
			<week-switch @weekSelected="onWeekSelected" />
			<search
				id="index-page__search"
				:seeking="seeking"
				:placeholder="'Найти и запомнить группу…'"
				:prompts="
					(groups || []).map((group) => ({
						raw: group,
						stringified: group.groupSuffix ? `${group.groupName} (${group.groupSuffix})` : group.groupName
					}))
				"
				:bigger="windowWidth > 600"
				@search-on-choose="searchOnChoose"
			/>
			<div
				id="index-page__search__supporter"
				class="default-no-select default-bold"
				v-if="groups && groups.length"
			>
				Сейчас в базе есть {{ groupsFineCount }}
			</div>

			<preview />

			<div id="index-page__choice">
				<div class="index-page__choice__card">
					<div class="index-page__choice__card__header default-header">
						<span data-nosnippet class="material-icons material-icons-round">language</span>
						<span>mirea.xyz</span>
					</div>
					<div class="index-page__choice__card__content">
						<p>
							Здесь ты сможешь найти расписание для своей группы – мы обновляем его из источников каждые
							полчаса. Для начала выбери свою группу выше. Кстати, благодаря кэшу этот сайт может работать
							без интернета.
						</p>
					</div>
				</div>

				<a
					href="https://t.me/mirea_table_bot"
					target="_blank"
					rel="noopener noreferrer"
					class="index-page__choice__card"
				>
					<div class="index-page__choice__card__header default-header">
						<span data-nosnippet class="material-icons material-icons-round">smart_toy</span>
						<a href="https://t.me/mirea_table_bot" target="_blank" rel="noopener noreferrer"
							>Telegram-бот</a
						>
					</div>
					<div class="index-page__choice__card__content">
						<p>
							В твоём любимом мессенджере. Кроме обычного просмотра расписания на
							<i>сегодня-завтра-неделю-две-три</i>, умеет рассылать расписание утром и вечером, чтобы ты
							не забывал его.
						</p>
					</div>
				</a>

				<router-link to="/scheme" class="index-page__choice__card">
					<div class="index-page__choice__card__header default-header">
						<span data-nosnippet class="material-icons material-icons-round">map</span>
						<router-link to="/scheme">Удобная карта</router-link>
					</div>
					<div class="index-page__choice__card__content">
						<p>
							У нас есть актуальная карта главного кампуса (<i>пр. Вернадского, 78</i>) с поиском по
							аудиториям.
						</p>
					</div>
				</router-link>

				<div class="index-page__choice__card">
					<div class="index-page__choice__card__header default-header">
						<span data-nosnippet class="material-icons material-icons-round">calendar_month</span>
						<span>Экспорт в календарь</span>
					</div>
					<div class="index-page__choice__card__content">
						<p>
							Ты можешь экспортировать расписание в календарь – от Google, Apple и в любой другой. Для
							этого сначала введи свою группу выше, а затем нажми <i>«Экспортировать в .ics»</i> внизу
							страницы.
						</p>
					</div>
				</div>

				<router-link to="/docs/api" class="index-page__choice__card">
					<div class="index-page__choice__card__header default-header">
						<span data-nosnippet class="material-icons material-icons-round">api</span>
						<router-link to="/docs/api">У нас есть API</router-link>
					</div>
					<div class="index-page__choice__card__content">
						<p>Swagger UI или Redoc – просмотр и тестирование на выбор.</p>
					</div>
				</router-link>

				<a
					href="https://github.com/serguun42/mss"
					target="_blank"
					rel="noopener noreferrer"
					class="index-page__choice__card"
				>
					<div class="index-page__choice__card__header default-header">
						<svg
							class="octicon"
							height="32"
							viewBox="0 0 16 16"
							version="1.1"
							width="32"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
							></path>
						</svg>
						<a href="https://github.com/serguun42/mss" target="_blank" rel="noopener noreferrer"
							>А ещё у нас открыты исходники</a
						>
					</div>
					<div class="index-page__choice__card__content">
						<p>Репозиторий на Github – смотри, ставь звёздочку и пиши в «Issues».</p>
					</div>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
import { GetAllGroups, GetCurrentWeek, GetGroupsByName, GetGroupsByNameAndSuffix } from "@/utils/api";
import router from "@/router";
import store from "@/store";
import Day from "@/components/Day";
import Search from "@/components/Search.vue";
import WeekSwitch from "@/components/WeekSwitch.vue";
import CheckIfDayVisible from "@/utils/check-if-day-visible";
import Preview from "@/components/Preview.vue";

const LocalGetForm = (iNumber, iForms) => {
	iNumber = iNumber.toString();

	if ((iNumber.slice(-2)[0] == "1") & (iNumber.length > 1)) return iForms[2];
	if (iNumber.slice(-1) == "1") return iForms[0];
	else if (/2|3|4/g.test(iNumber.slice(-1))) return iForms[1];
	else if (/5|6|7|8|9|0/g.test(iNumber.slice(-1))) return iForms[2];
};

/** @typedef {import("@/types").DaySchedule & {certainWeek: number, customTitle: string, showOngoingAndPlannedLesson: boolean}} CustomDay */

export default {
	name: "index-page",
	components: {
		Day,
		Search,
		WeekSwitch,
		Preview
	},
	data() {
		return {
			windowWidth: window.innerWidth,
			/** @type {import("@/types").RichGroup} */
			savedUserGroup: {},
			/** @type {CustomDay[]} */
			savedUserGroupDays: [],
			currentWeek: -1,
			groups: [],
			seeking: {
				raw: "",
				parsed: ""
			},
			groupsFineCount: "много групп",
			loadedOnce: false
		};
	},
	created() {
		Dispatcher.call("preload");

		GetCurrentWeek()
			.then((weekFromApi) => {
				this.currentWeek = weekFromApi;

				if (store.getters.userGroup?.name) {
					return (
						store.getters.userGroup?.suffix
							? GetGroupsByName(store.getters.userGroup?.name)
							: GetGroupsByNameAndSuffix(store.getters.userGroup?.name, store.getters.userGroup?.suffix)
					)
						.then((groups) => {
							if (!groups?.[0]) return Promise.reject("No group");

							this.savedUserGroup = groups[0];

							const dayOfWeek = new Date().getDay();
							const hours = new Date().getHours();
							const minutes = new Date().getMinutes();

							/** @type {CustomDay} */
							const today =
								this.savedUserGroup.schedule[dayOfWeek - 1 < 0 ? 7 + (dayOfWeek - 1) : dayOfWeek - 1];
							if (today) {
								today.customTitle = "Сегодня";
								today.certainWeek = this.currentWeek;
								today.showOngoingAndPlannedLesson = true;
							}

							/** @type {CustomDay} */
							const tomorrow = this.savedUserGroup.schedule[dayOfWeek % 7];
							if (tomorrow) {
								tomorrow.customTitle = "Завтра";
								tomorrow.certainWeek = this.currentWeek + (dayOfWeek === 0);
								tomorrow.showOngoingAndPlannedLesson = false;
							}

							/** @type {CustomDay} */
							const dayAfterTomorrow = this.savedUserGroup.schedule[(dayOfWeek + 1) % 7];
							if (dayAfterTomorrow) {
								dayAfterTomorrow.customTitle = "Послезавтра";
								dayAfterTomorrow.certainWeek = this.currentWeek + (dayOfWeek === 6 || dayOfWeek === 0);
								dayAfterTomorrow.showOngoingAndPlannedLesson = false;
							}

							this.savedUserGroupDays = (
								hours > 19 || (hours === 19 && minutes >= 30)
									? [tomorrow, dayAfterTomorrow]
									: [today, tomorrow]
							)
								.filter(Boolean)
								.filter((day) => CheckIfDayVisible(day.certainWeek, day));
						})
						.catch(console.warn);
				} else {
					return GetAllGroups().then((groups) => {
						this.groups = groups;

						if (groups?.length)
							this.groupsFineCount = `${groups.length} ${LocalGetForm(groups.length, [
								"группа",
								"группы",
								"групп"
							])}`;
					});
				}
			})
			.catch(console.warn)
			.finally(() => {
				Dispatcher.call("preloadingDone");
				this.loadedOnce = true;
			});
	},

	mounted() {
		this.$nextTick(() => window.addEventListener("resize", this.onResize));
	},

	beforeDestroy() {
		window.removeEventListener("resize", this.onResize);
	},

	methods: {
		onResize() {
			this.windowWidth = window.innerWidth;
		},
		searchOnChoose(result) {
			store.dispatch("saveGroup", { name: result.groupName, suffix: result.groupSuffix, noReload: true });

			router.push({
				path: "/group",
				query: {
					name: result.groupName,
					suffix: result.groupSuffix || null
				}
			});
		},
		/**
		 * @param {number} week
		 */
		onWeekSelected(week) {
			router.push({ path: "/group", query: { preselectedWeek: week } });
		}
	}
};
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

.index-page__subtitle {
	text-align: center;
	color: var(--index-page-faded-title);
}

.index-page__no-lessons-in-days {
	margin: 64px 0 16px;

	text-align: center;
	color: var(--index-page-faded-title);
}

#index-page__group {
	display: block;
	position: relative;

	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.index-page__group__title {
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

#index-page__search {
	display: block;
	position: relative;

	width: calc(100% - 32px);
	max-width: 600px;
	margin: 2em auto 1em;

	z-index: 2;
}

#index-page__search__supporter {
	display: block;
	position: relative;

	width: 100%;

	margin: 1em auto;
	padding: 0 32px;
	box-sizing: border-box;

	text-align: center;

	color: var(--index-page-faded-title);
}

#index-page__choice {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px 16px;
	position: relative;

	width: 100%;
	max-width: 1400px;

	margin: 0 auto;
	padding: 32px 16px;
	box-sizing: border-box;
}

@media (min-width: 1200px) {
	#index-page__choice {
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
}

@media (max-width: 600px) {
	#index-page__choice {
		grid-template-columns: 1fr;
	}
}

.index-page__choice__card {
	display: block;
	position: relative;

	margin: 0;
	padding: 16px;
	box-sizing: border-box;

	border-radius: 8px;
	background-color: var(--card-color);
	color: var(--text-color);
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);

	transition: box-shadow 150ms ease-in-out 0s;
	text-decoration: none;
}

.index-page__choice__card:hover {
	box-shadow: 0 1px 6px 2px rgba(100, 100, 100, 0.2);
}

.index-page__choice__card__header {
	text-align: left;
	margin-bottom: 0.5em;
}

.index-page__choice__card__header .material-icons {
	margin-right: 8px;
	color: var(--primary-color);
	vertical-align: -4px;
}

.index-page__choice__card__header .octicon {
	width: 24px;
	height: 24px;

	margin-right: 8px;
	vertical-align: -6px;
	color: var(--primary-color);
	fill: var(--primary-color);
}
</style>
