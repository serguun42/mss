import Vue from "vue";
import Vuex, { Store } from "vuex";
import Dispatcher from "./utils/dispatcher";
import ANIMATIONS_CONFIG from "./config/animations.json";

const userGroup = JSON.parse(localStorage.getItem("user-group")) || {};


/** @typedef {"light" | "dark" | "auto"} ThemeEnum */
/**
 * @typedef {Object} ThemeObject
 * @property {ThemeEnum} raw
 * @property {Boolean} dark
 * @property {String} icon
 * @property {String} name
 */

const StoreLocalGetRawTheme = () => localStorage.getItem("theme-raw");

/**
 * @param {ThemeEnum} [iThemeRaw]
 */
const StoreLocalCheckIfItsDarkTheme = (iThemeRaw = "") => {
	const themeRaw = iThemeRaw || StoreLocalGetRawTheme();
	if (themeRaw === "dark") return true;
	if (themeRaw === "light") return false;

	return (
		new Date().getHours() > 19 || (new Date().getHours() === 19 && new Date().getMinutes() >= 30) ||
		new Date().getHours() < 7 || (new Date().getHours() === 7 && new Date().getMinutes() <= 29)
	);
};

/**
 * @param {ThemeEnum} iThemeRaw
 */
const StoreLocalGetThemeIcon = (iThemeRaw) => iThemeRaw === "light" ? "light_mode" : iThemeRaw === "dark" ? "dark_mode" : "auto_awesome";

/**
 * @param {ThemeEnum} iThemeRaw
 */
const StoreLocalGetThemeName = (iThemeRaw) => iThemeRaw === "light" ? "светлая тема" : iThemeRaw === "dark" ? "тёмная тема" : "автоматическая тема";

/**
 * @param {ThemeEnum} [iThemeRaw]
 * 
 * @returns {ThemeObject}
 */
const StoreLocalGetCompleteTheme = (iThemeRaw = "") => {
	const themeRaw = iThemeRaw || StoreLocalGetRawTheme();

	return {
		raw: themeRaw,
		dark: StoreLocalCheckIfItsDarkTheme(themeRaw),
		icon: StoreLocalGetThemeIcon(themeRaw),
		name: StoreLocalGetThemeName(themeRaw)
	}
};



Vue.use(Vuex);

export default new Store({
	state: () => ({
		primaryColor: process.env.VUE_APP_PRIMARY_COLOR,
		rippleColor: process.env.VUE_APP_PRIMARY_COLOR,

		drawerOpened: false,

		userGroup: {
			name: "",
			suffix: "",
			...userGroup
		},

		/** @type {ThemeObject} */
		theme: StoreLocalGetCompleteTheme(),

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

		/**
		 * @param {ThemeEnum} newTheme
		 */
		theme(state, newTheme) {
			if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "auto")
				newTheme = "auto";

			localStorage.setItem("theme-raw", newTheme);
			state.theme = StoreLocalGetCompleteTheme(newTheme);
			Dispatcher.call("themeChanged");
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


		changeTheme({ state, commit, getters }) {
			const { raw } = state.theme,
				  themesToChoose = ["dark", "light", "auto", "dark"],
				  indexOfCurrentTheme = themesToChoose.indexOf(raw);

			commit("theme", themesToChoose[indexOfCurrentTheme + 1]);
		},
		/**
		 * @param {import("vuex").ActionContext} state
		 * @param {Boolean} [showMessage=false]
		 */
		clearCache({ dispatch }, showMessage = false) {
			caches.delete("cache_static").then(() => {
				if (showMessage)
					dispatch("showMessage", "Кеш успешно очищен")
			}).catch(() => {
				if (showMessage)
					dispatch("showMessage", "Произошла ошибка во время очистки кеша")
			});

			if (navigator.serviceWorker) {
				navigator.serviceWorker.getRegistrations().then((registered) => {
					for (const sw of registered) sw.unregister();
				});
			}
		}
	},
	getters: {
		primaryColor: (state) => state.primaryColor,
		rippleColor: (state) => state.rippleColor,
		drawerOpened: (state) => state.drawerOpened,
		userGroup: (state) => state.userGroup,
		theme: (state) => state.theme,

		message: (state) => state.message,
		lastMessageID: (state) => state.lastMessageID,
	},
	modules: {},
});
