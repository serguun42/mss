<template>
	<div id="mss-app-base">
		<preloader id="mss-app__preloader" v-if="preloading || documentLoading"></preloader>
		<message></message>
		<div id="router-wrapper">
			<transition name="fade-transition" mode="out-in">
				<router-view :key="$route.fullPath"></router-view>
			</transition>
		</div>
		<site-navigation :customTitle="pageTitle"></site-navigation>
		<site-footer></site-footer>
	</div>
</template>

<script>
import SiteNavigation from "./components/SiteNavigation.vue";
import SiteFooter from "./components/SiteFooter.vue";
import store from "./store";
import router from "./router";
import Preloader from "./views/Preloader.vue";
import Dispatcher from "./utils/dispatcher";
import Message from "./components/Message.vue";


export default {
	components: {
		SiteNavigation,
		SiteFooter,
		Preloader,
		Message
	},
	data() {
		return {
			preloading: true,
			documentLoading: true,
			pageTitle: router.currentRoute.meta?.title ?
						router.currentRoute.meta?.title
						:
						router.currentRoute.meta?.dynamicTitle && typeof router.currentRoute.meta?.dynamicTitle === "function" ?
							router.currentRoute.meta?.dynamicTitle(router.currentRoute) || process.env.VUE_APP_NAME
							:
							process.env.VUE_APP_NAME
		}
	},
	watch: {
		$route: {
			immediate: true,
			/**
			 * @param {import("vue-router/types").RouteConfig} to
			 */
			handler(to) {
				const newTitle = to.meta?.title
									? to.meta?.title
									: to.meta?.dynamicTitle && typeof to.meta?.dynamicTitle === "function"
									? to.meta?.dynamicTitle(to) || process.env.VUE_APP_NAME
									: process.env.VUE_APP_NAME;

				this.pageTitle = newTitle;

				/** @type {string} */
				const titleToSet = newTitle === process.env.VUE_APP_NAME
									? process.env.VUE_APP_NAME :
									`${newTitle} | ${process.env.VUE_APP_NAME}`
				document.title = titleToSet;

				const appleTitle = document.querySelector(`meta[name="apple-mobile-web-app-title"]`);
				if (appleTitle) appleTitle.setAttribute("content", titleToSet);

				const opengraphTitle = document.querySelector(`meta[property="og:title"]`);
				if (opengraphTitle) opengraphTitle.setAttribute("content", titleToSet);


				/** @type {string} */
				const descriptionToSet = newTitle === process.env.VUE_APP_NAME
										? process.env.VUE_APP_OPENGRAPH_DESCRIPTION :
										`${newTitle} | ${process.env.VUE_APP_OPENGRAPH_DESCRIPTION}`

				const generalDescription = document.querySelector(`meta[property="description"]`);
				if (generalDescription) generalDescription.setAttribute("content", descriptionToSet);

				const opengraphDescription = document.querySelector(`meta[property="og:description"]`);
				if (opengraphDescription) opengraphDescription.setAttribute("content", descriptionToSet);


				store.dispatch("closeDrawer");
			}
		}
	},
	created() {
		Dispatcher.link("preload", () => this.preloading = true);
		Dispatcher.link("preloadingDone", () => this.preloading = false);
		Dispatcher.link("documentLoadingDone", () => this.documentLoading = false);

		window.addEventListener("load", () => this.documentLoading = false);

		if (document.readyState === "complete")
			this.documentLoading = false;


		const LocalSetThemeToDocument = () => {
			if (store.getters.theme.dark)
				document.body.classList.add("is-dark");
			else
				document.body.classList.remove("is-dark");
		};

		LocalSetThemeToDocument();
		Dispatcher.link("themeChanged", LocalSetThemeToDocument);
	}
}
</script>

<style scoped>
#mss-app-base {
	display: block;
	position: relative;

	padding: 0;
	margin: 0;
	box-sizing: border-box;

	color: var(--text-color);
}

#mss-app__preloader {
	z-index: 20;
}

#router-wrapper {
	display: block;
	position: relative;

	width: 100%;
	min-height: 100%;
	min-height: 100vh;

	padding: 0;
	margin: 0;
	box-sizing: border-box;

	color: var(--text-color);
}

.fade-transition-enter-active,
.fade-transition-leave-active {
	transition: opacity var(--ROUTING_ANIMATION_MS) ease-in-out 0s;
}

.fade-transition-enter,
.fade-transition-leave-active {
	opacity: 0;
}
</style>
