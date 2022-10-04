/** @type {Partial<import("vue-router").RouteConfig>[]} */
const routes = [
	{
		path: "/",
		name: "Index",
	},
	{
		path: "/about",
		name: "About",
		meta: {
			title: "О проекте"
		}
	},
	{
		path: "/privacy",
		name: "Privacy",
		meta: {
			title: "Политика ПД"
		}
	},
	{
		path: "/docs/api",
		name: "API",
		meta: {
			title: "API"
		}
	},
	{
		path: "/docs/api/swagger",
		name: "APISwagger",
		meta: {
			title: "API – Swagger"
		}
	},
	{
		path: "/all",
		name: "AllGroups",
		meta: {
			title: "Все группы"
		}
	},
	{
		path: "/apps",
		name: "MobileApps",
		meta: {
			title: "Приложения"
		}
	},
	{
		path: "/stats",
		name: "Stats",
		meta: {
			title: "Статистика"
		}
	},
	{
		path: "/group",
		name: "SingleGroup",
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
		props: (route) => ({
			seekingRoom: route.query?.seekingRoom
		}),
		meta: {
			title: "Карта"
		}
	},
	{
		path: "*",
		name: "NotFound404",
		meta: {
			title: "Страница не найдена"
		}
	}
];

if (typeof module !== "undefined") module.exports = routes;
else exports = routes;
