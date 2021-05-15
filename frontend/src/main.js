import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VWave from "v-wave";

Vue.config.productionTip = false;

Vue.use(VWave, {
	color: store.getters.theme.dark ? "#FFFFFF" : getComputedStyle(document.documentElement).getPropertyValue("--ripple-color") || store.getters.rippleColor,
	startingOpacity: 0.4,
	finialOpacity: 0.6,
	duration: 0.3,
	easing: "ease-in",
	directive: "ripple"
});

import ANIMATIONS_CONFIG from "./config/animations.json";
Object.keys(ANIMATIONS_CONFIG).forEach((animationName) => {
	const animationValue = (
		/ms$/i.test(animationName) ?
			`${ANIMATIONS_CONFIG[animationName]}ms`
		:
			/s$/i.test(animationName) ?
			`${ANIMATIONS_CONFIG[animationName]}s`
		:
			ANIMATIONS_CONFIG[animationName]
		);

	document.documentElement.style.setProperty(`--${animationName}`, animationValue)
});

if (process.env.NODE_ENV !== "development") {
	window.addEventListener("load", () => {
		if ("serviceWorker" in navigator)
			navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
	});
}

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");

window.addEventListener("load", () => {
	fetch("/version.txt")
	.then((res) => {
		if (res.status === 200)
			return res.text();
		else
			Promise.reject(`Status code ${res.status} ${res.statusText}`);
	})
	.then((versionFileContents) => {
		if (typeof versionFileContents !== "string") return;
		if (!versionFileContents.length) return;
		
		const splitted = versionFileContents.split("=");
		if (!splitted[1]) return;

		const buildHashFromFile = splitted[1];
 
		if (buildHashFromFile !== process.env.BUILD_HASH) {
			/**
			 * Clear cache and SW because of build hash difference
			 */

			store.dispatch("clearCache", true);
		}
	})
	.catch((e) => {
		if (process.env.NODE_ENV === "development")
			console.warn(e);
	});
});
