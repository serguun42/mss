import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VWave from "v-wave";
import ANIMATIONS_CONFIG from "./config/animations.json";


Vue.config.productionTip = false;


Vue.use(VWave, {
	color: store.getters.theme.dark ? "#FFFFFF" : getComputedStyle(document.documentElement).getPropertyValue("--ripple-color") || store.getters.rippleColor,
	startingOpacity: 0.4,
	finialOpacity: 0.6,
	duration: 0.3,
	easing: "ease-in",
	directive: "ripple"
});


const styleBlockWithAnimationsContent = Object.keys(ANIMATIONS_CONFIG).map((animationName) => {
	const animationValue = (
		/ms$/i.test(animationName) ?
			`${ANIMATIONS_CONFIG[animationName]}ms`
		:
			/s$/i.test(animationName) ?
			`${ANIMATIONS_CONFIG[animationName]}s`
		:
			ANIMATIONS_CONFIG[animationName]
		);

	return `\t--${animationName}: ${animationValue};`;
}).join("\n");

if (document.getElementById("style-block-with-animations")) {
	document.getElementById("style-block-with-animations").innerHTML += `\n\n:root {\n${styleBlockWithAnimationsContent}\n}`;
} else {
	const styleBlockWithAnimations = document.createElement("style");
		  styleBlockWithAnimations.id = "style-block-with-animations";
		  styleBlockWithAnimations.innerHTML = `:root {\n${styleBlockWithAnimationsContent}\n}`;

	document.head.appendChild(styleBlockWithAnimations);
}


if (process.env.NODE_ENV !== "development") {
	if ("serviceWorker" in navigator)
		navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
}


new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");

window.addEventListener("load", () => {
	fetch("/build_hash")
	.then((res) => {
		if (res.status === 200)
			return res.text();

		return Promise.reject(new Error(`Status code ${res.status} ${res.statusText}`));
	})
	.then((buildHashFromFile) => {
		/**
		 * Clear cache and SW because of build hash difference
		 */
		if (buildHashFromFile !== process.env.BUILD_HASH)
			store.dispatch("clearCache", true);
	})
	.catch(console.warn);
});
