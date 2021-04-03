<template>
	<div id="index-page">
		<h1>Welcome to <a href="https://mirea.xyz" target="_blank" rel="noopener noreferrer">mirea.xyz</a></h1>
		<h2>Coming soon…</h2>
	</div>
</template>

<script>
import { GetAllGroups, GetGroupsByName } from "../utils/api";

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

export default {
	name: "index-page"
}
</script>

<style>

</style>