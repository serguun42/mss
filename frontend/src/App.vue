<template>
	<div id="mss-app-base">
		<div id="router-wrapper">
			<router-view></router-view>
		</div>
		<site-navigation :customTitle="$route.meta.title"></site-navigation>
		<site-footer></site-footer>
	</div>
</template>

<script>
import SiteNavigation from "./components/SiteNavigation.vue";
import SiteFooter from "./components/SiteFooter.vue";
import store from "./store";


export default {
	components: {
		SiteNavigation,
		SiteFooter
	},
	watch: {
		$route: {
			immediate: true,
			handler(to) {
				document.title = to.meta?.title ? `${to.meta?.title} | ${process.env.VUE_APP_NAME}` : process.env.VUE_APP_NAME;
				store.dispatch("closeDrawer");
			}
		}
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
</style>
