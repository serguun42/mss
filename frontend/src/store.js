import Vue from "vue";
import Vuex, { Store } from "vuex";
import Dispatcher from "./utils/dispatcher";
import ANIMATIONS_CONFIG from "./config/animations.json";
import router from "./router";

const userGroup = JSON.parse(localStorage.getItem("user-group")) || {};

Vue.use(Vuex);

export default new Store({
	state: () => ({
		darkMode: false,
		primaryColor: process.env.VUE_APP_PRIMARY_COLOR,
		rippleColor: process.env.VUE_APP_PRIMARY_COLOR,

		drawerOpened: false,

		userGroup: {
			name: userGroup?.name,
			suffix: userGroup?.suffix
		},

		message: {
			text: "",
			shown: false,
		},
	}),
	mutations: {
		/**
		 * @param {Boolean} status 
		 */
		setDrawerStatus(state, status) {
			state.drawerOpened = status;
		},

		userGroup(state, payload) {
			state.userGroup = { ...payload };	
		},

		/**
		 * @param {{text?: String, shown?: Boolean}} payload
		 */
		setMessage(state, payload) {
			state.message = { ...payload };
		},
		/**
		 * @param {String} messageID
		 */
		lastMessageID(state, messageID) {
			state.lastMessageID = messageID;
		},
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
		 * @param {{name: string, suffix?: string, noReload: boolean}} param1
		 */
		saveGroup({ commit }, { name, suffix, noReload }) {
			if (!suffix) suffix = "";

			if (!name) {
				commit("userGroup", {});
				localStorage.removeItem("user-group");
			} else {
				commit("userGroup", { name: name, suffix: suffix });
				localStorage.setItem("user-group", JSON.stringify({ name: name, suffix: suffix }));
			}

			Dispatcher.call("userGroupUpdated");

			if (!noReload)
				window.location.reload();
		},

		/**
		 * @param {{commit: Function, getters: { lastMessageID: String }}} state
		 * @param {String} messageText
		 */
		showMessage({ commit, dispatch, getters }, messageText) {
			commit("setMessage", { text: messageText, shown: true });

			const currentMessageID = `${messageText}_${Date.now()}`;
			commit("lastMessageID", currentMessageID);

			const themeColorMetaTags = Array.from(document.head.querySelectorAll(`[data-meta-name="theme-color"]`));
			themeColorMetaTags.forEach((metaTag) => metaTag.setAttribute("content", "#FFFFFF"));

			setTimeout(() => {
				if (getters.lastMessageID !== currentMessageID) return;

				dispatch("hideMessage");
			}, ANIMATIONS_CONFIG.DEFAULT_MESSAGE_SHOWN_TIME_MS);
		},
		/**
		 * @param {{commit: Function}} state
		 */
		hideMessage({ commit }) {
			commit("setMessage", { hiding: true });

			const currentMessageID = `Hiding message from Message module_${Date.now()}`;
			commit("lastMessageID", currentMessageID);

			const themeColorMetaTags = Array.from(document.head.querySelectorAll(`[data-meta-name="theme-color"]`));
			themeColorMetaTags.forEach((metaTag) => metaTag.setAttribute("content", process.env.VUE_APP_PRIMARY_COLOR));
		},
	},
	getters: {
		primaryColor: (state) => state.primaryColor,
		rippleColor: (state) => state.darkMode ? "#FFFFFF" : state.rippleColor,
		drawerOpened: (state) => state.drawerOpened,
		userGroup: (state) => state.userGroup,

		message: (state) => state.message,
		lastMessageID: (state) => state.lastMessageID,
	},
	modules: {},
});
