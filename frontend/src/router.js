import Vue from "vue";
import VueRouter from "vue-router";
import Index from "./views/Index.vue";
import About from "./views/About.vue";
import API from "./views/API.vue";
import APISwagger from "./views/APISwagger.vue";
import AllGroups from "./views/AllGroups.vue";
import Privacy from "./views/Privacy.vue";
import SingleGroup from "./views/SingleGroup.vue";
import MobileApps from "./views/MobileApps.vue";
import Stats from "./views/Stats.vue";
import Scheme from "./views/Scheme.vue";
import NotFound404 from "./views/404.vue";
import ANIMATIONS_CONFIG from "./config/animations.json";

Vue.use(VueRouter);

/** @type {import("vue-router").RouteConfig[]} */
const routes = [
	{
		path: "/",
		name: "Index",
		component: Index
	},
	{
		path: "/about",
		name: "About",
		component: About,
		meta: {
			title: "О проекте"
		}
	},
	{
		path: "/privacy",
		name: "Privacy",
		component: Privacy,
		meta: {
			title: "Политика ПД"
		}
	},
	{
		path: "/docs/api",
		name: "API",
		component: API,
		meta: {
			title: "API"
		}
	},
	{
		path: "/docs/api/swagger",
		name: "APISwagger",
		component: APISwagger,
		meta: {
			title: "API – Swagger"
		}
	},
	{
		path: "/all",
		name: "AllGroups",
		component: AllGroups,
		meta: {
			title: "Все группы"
		}
	},
	{
		path: "/apps",
		name: "MobileApps",
		component: MobileApps,
		meta: {
			title: "Приложения"
		}
	},
	{
		path: "/stats",
		name: "Stats",
		component: Stats,
		meta: {
			title: "Статистика"
		}
	},
	{
		path: "/group",
		name: "SingleGroup",
		component: SingleGroup,
		props: (route) => ({
			name: route.query?.name,
			suffix: route.query?.suffix,
			preselectedWeek: parseInt(route.query?.preselectedWeek) || undefined,
		}),
		meta: {
			dynamicTitle: (route) => (
				route.query?.name
				? "Группа"
				: "Моя группа"
			)
		}
	},
	{
		path: "/scheme",
		name: "Scheme",
		component: Scheme,
		meta: {
			title: "Карта"
		}
	},
	{
		path: "*",
		name: "404",
		component: NotFound404,
		meta: {
			title: "Страница не найдена"
		}
	}
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
	scrollBehavior() {
		return new Promise((resolve) =>
			setTimeout(() => resolve({ x: 0, y: 0 }), ANIMATIONS_CONFIG.ROUTING_ANIMATION_MS)
		);
	}
});

export default router;
