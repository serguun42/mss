import Vue from "vue";
import Vuex, { Store } from "vuex";
import Dispatcher from "./utils/dispatcher";
import ANIMATIONS_CONFIG from "./config/animations.json";
import router from "./router";

Vue.use(Vuex);

export default new Store({
	state: () => ({
		darkMode: false,
		primaryColor: process.env.VUE_APP_PRIMARY_COLOR,
		rippleColor: process.env.VUE_APP_PRIMARY_COLOR,
		drawerOpened: false
	}),
	mutations: {
		/**
		 * @param {Boolean} status 
		 */
		setDrawerStatus(state, status) {
			state.drawerOpened = status;
		}
	},
	actions: {
		openDrawer(state) {
			state.commit("setDrawerStatus", true);
			Dispatcher.call("drawerOpened");
		},
		closeDrawer(state) {
			state.commit("setDrawerStatus", false);
			setTimeout(() => Dispatcher.call("drawerClosed"), ANIMATIONS_CONFIG.DRAWER_OPNENING_ANIMATION_MS)
		},
		/**
		 * @param {ActionContext} state 
		 * @param {{name: string, suffix?: string}} param1
		 */
		saveGroup(state, { name, suffix }) {
			if (!suffix) suffix = "";

			localStorage.setItem("user-group", JSON.stringify({ name: name, suffix: suffix }));

			window.location.reload();
		}
	},
	getters: {
		primaryColor: (state) => state.primaryColor,
		rippleColor: (state) => state.darkMode ? "#FFFFFF" : state.rippleColor,
		drawerOpened: (state) => state.drawerOpened,
		userGroup: () => JSON.parse(localStorage.getItem("user-group") || "{}") || {}
	},
	modules: {},
});
