<template>
	<div id="android-app">
		<i class="main-icon material-icons material-icons-round">android</i>
		<div class="main-title">Приложение уже загружается…</div>
		<div class="sub-title">Если это не так, <a href="/mss-app.apk">перейдите по ссылке</a>.</div>
	</div>
</template>

<script>
import Dispatcher from "../utils/dispatcher.js";

export default {
	name: "android-app",
	created() {
		Dispatcher.call("preloadingDone");
		window.location.assign("/mss-app.apk");
	}
}
</script>

<style scoped>
#android-app {
	display: block;
	position: relative;

	padding: 8em 0 0;
	box-sizing: border-box;

	text-align: center;
}

.main-icon {
	display: block;
	position: relative;

	font-size: 48px;
	text-align: center;

	color: var(--primary-color);
}

.main-title {
	display: block;
	position: relative;

	font-size: 36px;
	line-height: 1.35em;
	text-align: center;
}

.sub-title {
	display: block;
	position: relative;

	font-size: 18px;
	line-height: 1.35em;
	text-align: center;

	color: var(--android-app-page-faded-title);
}
</style>