<template>
	<div
		:class="{
			'site-navigation': true,
			'site-navigation--small': mobile,
			'site-navigation--large': !mobile,
			'default-no-select': true,
		}"
	>
		<div class="site-navigation__menu-button" v-if="mobile" v-ripple>
			<i class="material-icons material-icons-round" @click="openDrawer">menu</i>
		</div>
		<div class="site-navigation__title default-extra-bold" v-if="mobile">{{ customTitle || env.VUE_APP_NAME }}</div>

		<div class="site-navigation__pages-line" v-if="!mobile">
			<div class="site-navigation__pages-line__block">
				<span class="site-navigation__pages-line__block__sub default-bold">{{ customTitle || env.VUE_APP_NAME }}</span>
			</div>
			<div class="site-navigation__pages-line__block" v-ripple>
				<router-link class="site-navigation__pages-line__block__sub default-bold" to="/">
					<span class="material-icons material-icons-round">home</span>
					<span>Главная</span>
				</router-link>
			</div>
			<div class="site-navigation__pages-line__block" v-ripple>
				<router-link class="site-navigation__pages-line__block__sub default-bold" to="/group">
					<span class="material-icons material-icons-round">person</span>
					<span>Моя группа</span>
				</router-link>
			</div>
			<div class="site-navigation__pages-line__block" v-ripple>
				<router-link class="site-navigation__pages-line__block__sub default-bold" to="/all">
					<span class="material-icons material-icons-round">groups</span>
					<span>Все группы</span>
				</router-link>
			</div>
		</div>

		<div :class="{
			'site-navigation__drawer': true,
			'is-opened': $store.getters.drawerOpened
		}" v-if="mobile">
			<section class="site-navigation__section" id="site-navigation__section--logo">
				<img id="site-navigation__logo-img" src="/img/icons/round/round_512x512.png" draggable="false" oncontextmenu="return false" alt="MSS">
				<div id="site-navigation__logo-desc">
					<div id="site-navigation__logo-desc__title" class="default-extra-bold">MSS</div>
				</div>
			</section>

			<div class="site-navigation__section site-navigation__drawer__wrapper">
				<router-link class="site-navigation__drawer__link default-bold" v-ripple to="/all">
					<span class="material-icons material-icons-round">groups</span>
					<span>Все группы</span>
				</router-link>
				<router-link class="site-navigation__drawer__link default-bold" v-ripple to="/group">
					<span class="material-icons material-icons-round">person</span>
					<span>Моя группа</span>
				</router-link>
				<router-link class="site-navigation__drawer__link default-bold" v-ripple to="/">
					<span class="material-icons material-icons-round">home</span>
					<span>Главная</span>
				</router-link>
			</div>
		</div>
		<div :class="{
			'site-navigation__drawer--obfuscator': true,
			'is-shown': $store.getters.drawerOpened
		}" v-if="mobile" @click="closeDrawer" @contextmenu="closeDrawer"></div>
	</div>
</template>

<script>
import store from '@/store';
import Dispatcher from "@/utils/dispatcher";

export default {
	props: {
		customTitle: String,
	},
	data: () => ({
		windowWidth: window.innerWidth,
		mobile: window.innerWidth <= 800,
		env: process.env,
		obfuscator: null
	}),

	mounted() {
		this.$nextTick(() => window.addEventListener("resize", this.onResize));

		this.obfuscator = this.$el.querySelector(".site-navigation__drawer--obfuscator");

		Dispatcher.link("drawerOpened", () => {
			if (this.obfuscator)
				this.obfuscator.style.display = "block";
		});

		Dispatcher.link("drawerClosed", () => {
			if (this.obfuscator)
				this.obfuscator.style.display = "none";
		});
	},

	beforeDestroy() {
		window.removeEventListener("resize", this.onResize);
	},

	methods: {
		onResize() {
			this.windowWidth = window.innerWidth;
			this.mobile = window.innerWidth <= 800;
			setTimeout(() => this.obfuscator = this.$el.querySelector(".site-navigation__drawer--obfuscator"), 50);
			store.dispatch("closeDrawer");
		},
		openDrawer() {
			store.dispatch("openDrawer");
		},
		closeDrawer() {
			store.dispatch("closeDrawer");
		}
	},

	name: "site-navigation",
};
</script>

<style scoped>
.site-navigation {
	display: block;
	position: fixed;

	background-color: var(--navigation-color);
	color: var(--primary-color);

	box-shadow: 0 0 3px 1px rgba(50, 50, 50, 0.2);

	z-index: 9;
}

.site-navigation--small {
	width: 100%;
	height: 52px;
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

.site-navigation__menu-button {
	display: block;
	position: absolute;

	width: 44px;
	height: 44px;
	top: 4px;
	left: 4px;

	margin: 0;
	padding: 10px;
	box-sizing: border-box;
	border-radius: 50%;

	border: none;
	outline: none;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
}

.site-navigation__title {
	display: block;
	position: absolute;

	width: calc(100% - 52px);
	height: 52px;
	top: 0;
	left: 52px;

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

.site-navigation__pages-line__block {
	display: flex;
	flex-direction: column;
	justify-content: center;
	flex-wrap: nowrap;
	position: relative;

	height: 100%;
	border-radius: 22px;

	overflow: hidden;
}

.site-navigation__pages-line__block.is-focused {
	background-color: var(--primary-color-faded);
}

.site-navigation__pages-line__block__sub {
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

.site-navigation__pages-line__block__sub a {
	border: none;
	outline: none;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
}

.site-navigation__pages-line__block__sub .material-icons {
	vertical-align: -5px;
	margin-right: 8px;
}

.site-navigation__drawer {
	display: block;
	position: fixed;

	width: 300px;
	height: 100%;
	top: 0;
	left: -300px;

	margin: 0;
	padding: 0;
	box-sizing: border-box;

	background-color: #fff;
	color: var(--text-color);

	z-index: 11;

	opacity: 0;

	overflow-x: hidden;
	overflow-y: auto;

	transition: all var(--DRAWER_OPNENING_ANIMATION_MS) ease-in-out 0s;
}

.site-navigation__drawer.is-opened {
	left: 0;
	opacity: 1;
}

.site-navigation__section {
	display: flex;
	position: relative;

	width: 100%;

	margin: 0;
	padding: 24px;
	box-sizing: border-box;
}

#site-navigation__section--logo {
	flex-direction: row;
	height: calc(64px + 24px * 2);
}

#site-navigation__logo-img {
	display: block;
	position: relative;
	width: 64px;
	height: 64px;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

#site-navigation__logo-desc__title {
	display: block;
	position: relative;

	height: 64px;
	padding: 16px;
	box-sizing: border-box;

	line-height: 32px;
	color: var(--link-color);
}

.site-navigation__drawer__wrapper {
	display: flex;
	flex-direction: column-reverse;
	justify-content: flex-start;
	flex-wrap: nowrap;
	position: relative;

	width: 100%;
	height: calc(100% - (64px + 24px * 2));

	margin: 0;
	padding: 32px 0;
	box-sizing: border-box;
}

@media (max-height: 320px) {
	#site-navigation__section--logo {
		padding: 8px;
		height: unset;
	}

	.site-navigation__drawer__wrapper {
		height: calc(100% - 80px);
		padding: 8px;
	}
}

.site-navigation__drawer__link {
	display: block;
	position: relative;

	width: 100%;
	line-height: 24px;

	margin: 0;
	padding: 16px 24px;
	box-sizing: border-box;

	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	text-decoration: none;
	border: none;
	outline: none;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
}

.site-navigation__drawer__link .material-icons {
	vertical-align: -5px;
	margin-right: 8px;
}

.site-navigation__drawer--obfuscator {
	display: none;
	position: fixed;

	width: 100%;
	width: 100vw;
	height: 100%;
	height: 100vh;
	top: 0;
	left: 0;

	z-index: 10;

	background-color: rgba(0, 0, 0, 0.3);

	opacity: 0;

	transition: all var(--DRAWER_OPNENING_ANIMATION_MS) ease-in-out 0s;

	border: none;
	outline: none;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
}

.site-navigation__drawer--obfuscator.is-shown {
	opacity: 1;
}
</style>
