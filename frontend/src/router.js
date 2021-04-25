import Vue from "vue";
import VueRouter from "vue-router";
import Index from "./views/Index.vue";
import About from "./views/About.vue";
import API from "./views/API.vue";
import APISwagger from "./views/APISwagger.vue";
import NotFound404 from "./views/404.vue";

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
		path: "/docs/api",
		name: "API",
		component: API,
		meta: {
			title: "MSS project's API"
		}
	},
	{
		path: "/docs/api/swagger",
		name: "API",
		component: APISwagger,
		meta: {
			title: "API – Swagger"
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
	scrollBehavior(to, from, savedPosition) {
		
		return { x: 0, y: 0 };
	}
});

export default router;
