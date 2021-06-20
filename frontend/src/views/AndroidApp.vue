<template>
	<div id="android-app"></div>
</template>

<script>
export default {
	name: "android-app",
	created() {
		window.location.assign(`/mss-app.apk`);
	}
}
</script>

<style scoped>
#android-app {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;

	text-align: center;
}
</style>