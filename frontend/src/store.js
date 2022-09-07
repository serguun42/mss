import Vue from "vue";
import Vuex, { Store } from "vuex";
import Dispatcher from "./utils/dispatcher";
import ANIMATIONS_CONFIG from "./config/animations.json";
import { ExportToIcs } from "./utils/export-to-ics";

Vue.use(Vuex);



const userGroup = JSON.parse(localStorage.getItem("user-group")) || {};


/** @typedef {"light" | "dark" | "schedule" | "system"} ThemeEnum */
/**
 * @typedef {Object} ThemeObject
 * @property {ThemeEnum} raw
 * @property {boolean} dark
 * @property {string} icon
 * @property {string} name
 */

const StoreLocalGetRawTheme = () => localStorage.getItem("theme-raw");

/**
 * @param {ThemeEnum} [iThemeRaw]
 */
const StoreLocalCheckIfItsDarkTheme = (iThemeRaw = "") => {
	/** @type {ThemeEnum} */
	const themeRaw = iThemeRaw || StoreLocalGetRawTheme();
	if (themeRaw === "dark") return true;

	if (themeRaw === "schedule") return (
		new Date().getHours() > 19 || (new Date().getHours() === 19 && new Date().getMinutes() >= 30) ||
		new Date().getHours() < 7 || (new Date().getHours() === 7 && new Date().getMinutes() <= 29)
	);

	if (themeRaw === "light") return false;

	return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
};

window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", (mediaQueryListEvent) => {
	if (["light", "dark", "schedule"].includes(store.getters.theme.raw)) return;

	store.commit("theme", "system");
});

/**
 * @param {ThemeEnum} iThemeRaw
 */
const StoreLocalGetThemeIcon = (iThemeRaw) => {
	return (
		iThemeRaw === "light" ? "light_mode" :
		iThemeRaw === "dark" ? "dark_mode" :
		iThemeRaw === "schedule" ? "auto_awesome" :
		"settings_suggest"
	);
};

/**
 * @param {ThemeEnum} iThemeRaw
 */
const StoreLocalGetThemeName = (iThemeRaw) => {
	return (
		iThemeRaw === "light" ? "светлая тема (постоянно)" :
		iThemeRaw === "dark" ? "тёмная тема (постоянно)" :
		iThemeRaw === "schedule" ? "тема по расписанию (тёмная после 19:30)" :
		"системная тема"
	);
};

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



const store = new Store({
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
		 * @param {boolean} status 
		 */
		setDrawerStatus(state, status) {
			state.drawerOpened = status;
		},

		userGroup(state, payload) {
			state.userGroup = { ...payload };	
		},

		/**
		 * @param {{text?: String, shown?: boolean}} payload
		 */
		setMessage(state, payload) {
			state.message = { ...payload };
		},
		/**
		 * @param {string} messageID
		 */
		lastMessageID(state, messageID) {
			state.lastMessageID = messageID;
		},

		/**
		 * @param {ThemeEnum} newTheme
		 */
		theme(state, newTheme) {
			if (newTheme !== "light" && newTheme !== "dark" && newTheme !== "schedule" && newTheme !== "system")
				newTheme = "system";

			localStorage.setItem("theme-raw", newTheme);
			state.theme = StoreLocalGetCompleteTheme(newTheme);
			Dispatcher.call("themeChanged");
		}
	},
	actions: {
		openDrawer({ commit }) {
			commit("setDrawerStatus", true);
			Dispatcher.call("drawerOpened");
		},
		closeDrawer({ commit }) {
			commit("setDrawerStatus", false);
			setTimeout(() => Dispatcher.call("drawerClosed"), ANIMATIONS_CONFIG.DRAWER_OPENING_ANIMATION_MS)
		},

		exportToIcs() {
			ExportToIcs();
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
		 * @param {string} messageText
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


		changeTheme({ state, commit }) {
			const { raw } = state.theme,
				  themesToChoose = ["dark", "light", "schedule", "system", "dark"],
				  indexOfCurrentTheme = themesToChoose.indexOf(raw);

			commit("theme", themesToChoose[indexOfCurrentTheme + 1]);
		},
		/**
		 * @param {import("vuex").ActionContext} state
		 * @param {boolean} [showMessage=false]
		 */
		clearCache({ dispatch }, showMessage = false) {
			caches.delete("cache_static_and_dynamic_with_api").then(() => {
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

export default store;
