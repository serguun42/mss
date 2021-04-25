<template>
	<div id="index-page">
		<h1>Welcome to <a href="https://mirea.xyz" target="_blank" rel="noopener noreferrer">mirea.xyz</a></h1>
		<h2>Coming soon. You can still read <router-link to="/about">/about</router-link> or <router-link to="/docs/api">API docs</router-link></h2>
	</div>
</template>

<script>
import { GetAllGroups, GetGroupsByName } from "../utils/api";

export default {
	name: "index-page",
	mounted() {
		GetAllGroups().then((groups) => {
			console.log({groups});

			return GetGroupsByName("ИКБО-03-20");
		}).then((groups) => {
			if (groups.length === 1)
				console.log(groups[0]);
			else if (groups.length)
				console.log("Multiple groups", groups);
			else
				console.warn("No groups!");
		}).catch(console.warn);
	}
}
</script>

<style scoped>
#index-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;

	text-align: center;
}
</style>