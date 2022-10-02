<template>
	<div
		:class="{
			'site-navigation': true,
			'site-navigation--small': mobile,
			'site-navigation--large': !mobile,
			'default-no-select': true
		}"
	>
		<div class="site-navigation__pages-line">
			<div class="site-navigation__block" v-if="!mobile">
				<span class="site-navigation__sub-block default-bold">{{
					customTitle || process.env.VUE_APP_NAME
				}}</span>
			</div>
			<div class="site-navigation__block" v-ripple>
				<router-link :class="{
					'site-navigation__sub-block default-pointer default-no-select': true,
					'site-navigation__sub-block--is-active': $route.path === '/',
				}" to="/">
					<span class="material-icons material-icons-round">home</span>
					<span class="site-navigation__page-title">Главная</span>
				</router-link>
			</div>
			<div class="site-navigation__block" v-ripple>
				<router-link :class="{
					'site-navigation__sub-block default-pointer default-no-select': true,
					'site-navigation__sub-block--is-active': $route.path === '/group',
				}" to="/group">
					<span class="material-icons material-icons-round">person</span>
					<span class="site-navigation__page-title">Моя группа</span>
				</router-link>
			</div>
			<div class="site-navigation__block" v-ripple>
				<router-link :class="{
					'site-navigation__sub-block default-pointer default-no-select': true,
					'site-navigation__sub-block--is-active': $route.path === '/all',
				}" to="/all">
					<span class="material-icons material-icons-round">groups</span>
					<span class="site-navigation__page-title">Все группы</span>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "site-navigation",
	props: {
		customTitle: String
	},
	data: () => ({
		windowWidth: window.innerWidth,
		mobile: window.innerWidth <= 800,
	}),

	mounted() {
		console.log(this.$route);
		this.$nextTick(() => window.addEventListener("resize", this.onResize));
	},

	beforeDestroy() {
		window.removeEventListener("resize", this.onResize);
	},

	methods: {
		onResize() {
			this.windowWidth = window.innerWidth;
			this.mobile = window.innerWidth <= 800;
		}
	},
};
</script>

<style scoped>
.site-navigation {
	display: block;
	position: fixed;

	background-color: var(--navigation-background-color);
	color: var(--navigation-text-color);

	box-shadow: 0 0 3px 1px var(--navigation-shadow-color);

	z-index: 9;
}

.site-navigation--small {
	width: 100%;
	height: 60px;
	bottom: 0;
	left: 0;

	margin: 0;
	padding: 0;
	box-sizing: border-box;

	border-radius: 0;
}

.site-navigation--large {
	width: 800px;
	height: 60px;
	bottom: 10px;
	left: calc(50% - 400px);

	margin: 0;
	padding: 0;
	box-sizing: border-box;

	border-radius: 30px;
	overflow: hidden;
}

.site-navigation__title {
	display: block;
	position: relative;

	width: 100%;

	margin: 0;
	padding: 14px;
	box-sizing: border-box;

	line-height: 24px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.site-navigation__pages-line {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	flex-wrap: nowrap;

	width: 100%;
	height: 100%;
	margin: 0;
	padding: 8px;
	box-sizing: border-box;
}

.site-navigation--small .site-navigation__pages-line {
	padding: 0;
}

.site-navigation__block {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	flex-wrap: nowrap;
	position: relative;

	height: 100%;
	border-radius: 22px;

	overflow: hidden;
}

.site-navigation--small .site-navigation__block {
	width: calc(100% / 3);
	border-radius: 9999px;
}

.site-navigation__sub-block {
	display: block;
	position: relative;

	height: 32px;
	padding: 4px 12px;
	box-sizing: border-box;

	line-height: 24px;
	border-radius: 16px;

	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	text-decoration: none;
}

.site-navigation--small .site-navigation__sub-block {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	flex-wrap: nowrap;
	position: relative;

	height: unset;

	color: var(--navigation-text-color);
}

.site-navigation--small .site-navigation__sub-block--is-active {
	color: var(--navigation-link-color);
}

.site-navigation__sub-block .material-icons {
	vertical-align: -5px;
	margin-right: 8px;
}

.site-navigation--small .site-navigation__sub-block .material-icons {
	margin-right: 0;
	margin-bottom: 4px;
}

.site-navigation__page-title {
	font-weight: 700;
}

.site-navigation--small .site-navigation__page-title {
	font-size: 12px;
	font-weight: 400;
	line-height: 1em;
}

.site-navigation--small .site-navigation__sub-block--is-active .site-navigation__page-title {
	font-size: 13.5px;
	font-weight: 700;
}
</style>
