<template>
	<div id="mobile-apps">
		<h2 id="header" class="default-header">Приложения для Android и iOS</h2>
		<h3 id="sub-header" class="default-header">От наших коллег по цеху</h3>

		<div class="card" v-for="appLink in APPS_LINKS" :key="appLink.title">
			<div class="card__header default-header" v-text="appLink.title"></div>
			<p class="card__description" v-if="appLink.description" v-text="appLink.description"></p>
			<div class="card__platforms-list">
				<a
					:class="`card__platform card__platform--${platform.type}`"
					:href="platform.url"
					target="_blank"
					rel="noopener noreferrer"
					v-for="platform in appLink.platforms"
					:key="platform.url"
				>
					<img
						:src="platform.custom_logo || PLATFORMS_BADGES[platform.type]"
						:alt="platform.type || ''"
						class="card__platform__image default-no-select"
					/>
					<div
						class="card__platform__custom-link"
						v-if="platform.type === 'web' && platform.custom_logo && platfromHostname(platform.url)"
						v-text="platfromHostname(platform.url)"
					></div>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher.js";
import APPS_LINKS from "@/config/apps-links.json";

const PLATFORMS_BADGES = {
	google_play: "/img/platforms/google_play_badge.png",
	app_store: "/img/platforms/app_store_badge.svg",
	git: "/img/platforms/git_logo.svg"
};

export default {
	name: "mobile-apps",
	data() {
		return {
			/** @type {import("@/types").AppsLinks} */
			APPS_LINKS,
			PLATFORMS_BADGES
		};
	},
	methods: {
		/**
		 * @param {string} platfromURL
		 * @returns {string}
		 */
		platfromHostname(platfromURL) {
			try {
				const parsedUrl = new URL(platfromURL);
				return parsedUrl.hostname;
			} catch (e) {
				return "";
			}
		}
	},
	mounted() {
		Dispatcher.call("preloadingDone");
	}
};
</script>

<style scoped>
#mobile-apps {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

#header {
	font-size: 28px;
	margin-bottom: 0.5em;
}

#sub-header {
	font-size: 20px;
	margin-bottom: 2em;

	color: var(--apps-page-faded-title);
}

.card {
	display: block;
	position: relative;

	width: calc(100% - 16px);
	max-width: 600px;
	margin: 0 auto;
	padding: 16px 16px 4px;
	box-sizing: border-box;

	border-radius: 8px;
	background-color: var(--card-color);
	color: var(--text-color);
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);

	transition: box-shadow 150ms ease-in-out 0s;
}

.card:hover {
	box-shadow: 0 1px 6px 2px rgba(100, 100, 100, 0.2);
}

.card:not(:last-of-type) {
	margin-bottom: 2em;
}

.card__header {
	text-align: left;
	margin-bottom: 0.5em;
}

.card__description {
	width: 100%;

	margin: 0 0 1em;
}

.card__platforms-list {
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	align-items: center;
	position: relative;
}

.card__platform {
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;
	align-items: center;
	position: relative;

	margin-right: 16px;
	margin-bottom: 16px;
}

.card__platform:last-of-type {
	margin-right: 0;
}

.card__platform__image {
	display: block;
	position: relative;

	max-width: 140px;
	max-height: 42px;
}

.card__platform--git .card__platform__image {
	max-height: 40px;
}

.is-dark .card__platform--git .card__platform__image {
	filter: invert(1);
}

.card__platform__custom-link {
	display: block;
	position: relative;

	margin-left: 12px;

	font-size: 20px;
	line-height: 1em;

	white-space: nowrap;
}
</style>
