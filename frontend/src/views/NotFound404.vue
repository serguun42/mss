<template>
	<div id="not-found-page">
		<h1>404 – не найдено!</h1>
		<h2><router-link to="/">На главную</router-link></h2>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
export default {
	name: "not-found-404",
	created() {
		Dispatcher.call("preloadingDone");
	}
}
</script>

<style scoped>
#not-found-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;

	text-align: center;
}
</style>