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
	if ("serviceWorker" in navigator)
		navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
