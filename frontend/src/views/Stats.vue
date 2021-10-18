<template>
	<div id="stats-page">
		<h1>Stats</h1>
		<div class="stats__cards">
			<div class="stats__card">
				<div class="stats__card__header default-header">groupsCount</div>
				<div class="stats__card__content">{{ apiData.groupsCount || 0 }}</div>
			</div>
			<div class="stats__card">
				<div class="stats__card__header default-header">scrapperUpdatedDate</div>
				<div class="stats__card__content">{{ apiData.scrapperUpdatedDate ? new Date(apiData.scrapperUpdatedDate).toISOString() : "Словно позавчера" }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import { Stats } from "@/utils/api"
import Dispatcher from "@/utils/dispatcher";

export default {
	name: "Stats",
	data() {
		return {
			/** @type {import("../types").Stats} */
			apiData: {}
		}
	},
	created() {
		Dispatcher.call("preload");

		Stats()
		.then((stats) => this.apiData = stats)
		.catch(console.warn)
		.finally(() => Dispatcher.call("preloadingDone"));
	}
}
</script>

<style scoped>
#stats-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

#stats-page h1,
#stats-page h3 {
	text-align: center;
}

.stats__cards {
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;

	width: 100%;
	max-width: 1000px;

	margin: 0 auto;
	padding: 32px 0;
}

.stats__card {
	display: block;
	position: relative;
	
	width: fit-content;
	margin: 16px;
	padding: 16px;
	box-sizing: border-box;

	border-radius: 8px;
	background-color: var(--card-color);
	color: var(--text-color);
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);

	transition: box-shadow 150ms ease-in-out 0s;
	text-decoration: none;
}

.stats__card:hover {
	box-shadow: 0 1px 6px 2px rgba(100, 100, 100, 0.2);
}

.stats__card__header {
	text-align: left;
	margin-bottom: 0.5em;
}
</style>