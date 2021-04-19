import Vue from "vue";
import Vuex, { Store } from "vuex";
import Dispatcher from "./utils/dispatcher";
import ANIMATIONS_CONFIG from "./config/animations.json";

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
		}
	},
	getters: {
		primaryColor: (state) => state.primaryColor,
		rippleColor: (state) => state.darkMode ? "#FFFFFF" : state.rippleColor,
		drawerOpened: (state) => state.drawerOpened,
	},
	modules: {},
});
