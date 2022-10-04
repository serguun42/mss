import Vue from "vue";
import VueRouter from "vue-router";
import ANIMATIONS_CONFIG from "../config/animations.json";

import routes from "./routes";

import Index from "../views/Index.vue";
import About from "../views/About.vue";
import API from "../views/API.vue";
import APISwagger from "../views/APISwagger.vue";
import AllGroups from "../views/AllGroups.vue";
import Privacy from "../views/Privacy.vue";
import SingleGroup from "../views/SingleGroup.vue";
import MobileApps from "../views/MobileApps.vue";
import Stats from "../views/Stats.vue";
import Scheme from "../views/Scheme.vue";
import NotFound404 from "../views/NotFound404.vue";

const allViews = {
	Index,
	About,
	API,
	APISwagger,
	AllGroups,
	Privacy,
	SingleGroup,
	MobileApps,
	Stats,
	Scheme,
	NotFound404
};

Vue.use(VueRouter);

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes: routes.map((route) => {
		route.component = allViews[route.name] || NotFound404;
		return route;
	}),
	scrollBehavior() {
		return new Promise((resolve) =>
			setTimeout(() => resolve({ x: 0, y: 0 }), ANIMATIONS_CONFIG.ROUTING_ANIMATION_MS)
		);
	}
});

export default router;
