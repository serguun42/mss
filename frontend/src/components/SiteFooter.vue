<template>
	<footer id="site-footer">
		<section class="site-footer__section" id="site-footer__section--logo">
			<img id="site-footer__logo-img" src="/img/icons/round/round_512x512.png" draggable="false" oncontextmenu="return false"
				alt="MSS">
			<div id="site-footer__logo-desc">
				<div id="site-footer__logo-desc__title">MSS</div><br><i
					class="material-icons material-icons-round">copyright</i> {{ new Date().getFullYear() }}
			</div>
		</section>

		<section class="site-footer__section">
			<div class="site-footer__section__item">
				<i class="material-icons">info</i> <router-link to="/about">О проекте</router-link>
			</div>
			<div class="site-footer__section__item">
				<svg class="octicon" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true">
					<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
				</svg> <a href="https://github.com/serguun42/mss" target="_blank" rel="noopener noreferrer">Github</a>
			</div>
			<div class="site-footer__section__item">
				<i class="material-icons">contact_mail</i> <a href="https://github.com/serguun42/mss/issues" target="_blank" rel="noopener noreferrer">Баги и пожелания</a>
			</div>
		</section>

		<section class="site-footer__section">
			<div class="site-footer__section__item">
				<i class="material-icons">android</i> <router-link to="/app">Android-приложение</router-link>
			</div>
			<div class="site-footer__section__item">
				<i class="material-icons">smart_toy</i> <a href="https://t.me/mirea_table_bot" target="_blank" rel="noopener noreferrer">Telegram-бот</a>
			</div>
		</section>

		<section class="site-footer__section">
			<div class="site-footer__section__item" id="footer-clear-cache">
				<i class="material-icons">cached</i> Очистить кэш
			</div>
			<div class="site-footer__section__item" id="footer-unregister-sw">
				<i class="material-icons">delete_outline</i> Удалить Service Worker
			</div>
		</section>
	</footer>
</template>

<script>
export default {
	name: "site-footer"
}
</script>

<style scoped>
#site-footer {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-around;
	align-items: center;
	position: relative;
	width: 100%;

	margin: 48px 0 0;
	box-sizing: border-box;
	padding: 32px 32px calc(32px + 80px);

	background-color: #333;
	color: #E1E1E1;

	z-index: 8;
}

@media (max-width: 800px) {
	#site-footer {
		padding: 20px 20px calc(20px + 52px);
	}
}

.site-footer__section {
	--min-footer-section-width: 100%;
}

@media (min-width: 500.01px) and (max-width: 1200px) {
	.site-footer__section {
		--min-footer-section-width: 30%;
	}
}

@media (min-width: 1200.01px) {
	.site-footer__section {
		--min-footer-section-width: 20%;
	}
}

.site-footer__section {
	display: block;
	position: relative;
	min-width: var(--min-footer-section-width);
	padding: 16px;
	margin: 0;
	box-sizing: border-box;
}

.site-footer__section__item {
	display: block;
	position: relative;
	padding: 0;
	margin: 0 0 8px;
	box-sizing: border-box;
	font-family: 'Roboto', 'Noto Sans', Arial, Helvetica, sans-serif;
	font-weight: 400;
	font-size: 16px;
	line-height: 1.35em;
}

.site-footer__section__item .material-icons {
	margin-right: 8px;
	vertical-align: -6px;
	color: #E1E1E1;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

.site-footer__section__item .octicon {
	width: 24px;
	height: 24px;

	margin-right: 8px;
	vertical-align: -6px;
	color: #E1E1E1;
	fill: #E1E1E1;
}

.site-footer__section__item:last-of-type {
	margin: 0;
}

.site-footer__section__item a {
	color: #E1E1E1;
}

#site-footer__section--logo {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: center;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

#site-footer__section--logo .material-icons {
	vertical-align: -6px;
	color: #E1E1E1;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

#site-footer__logo-img {
	display: block;
	position: relative;
	width: 64px;
	height: 64px;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

#site-footer__logo-desc {
	display: block;
	position: relative;
	padding: 8px 16px;
	box-sizing: border-box;
	font-family: 'Roboto', 'Noto Sans', Arial, Helvetica, sans-serif;
	font-weight: 400;
	font-size: 15px;
	line-height: 1.35em;
}

#site-footer__logo-desc__title {
	display: inline-block;
	font-family: 'Product Sans', 'Roboto', 'Noto Sans', Arial, Helvetica, sans-serif;
	font-size: 22px;
	margin-bottom: 8px;
}

.site-footer__section__item__vk-icon, .site-footer__section__item__ok-icon {
	display: inline-block;
	position: relative;
}

.site-footer__section__item__vk-icon img, .site-footer__section__item__ok-icon img {
	display: inline-block;
	position: relative;
	height: 16px;
	vertical-align: -2px;
}

#footer-clear-cache, #footer-unregister-sw {
	outline: none;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}
</style>