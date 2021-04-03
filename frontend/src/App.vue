<template>
	<div id="app">
		<!-- <div id="nav">
			<router-link to="/">Home</router-link> |
			<router-link to="/about">About</router-link>
		</div> -->
		<router-view /> 
	</div>
</template>

<style>
#app {
	display: block;
	position: relative;

	padding: 32px;
	box-sizing: border-box;

	text-align: center;
	color: var(--text-color);
}
</style>
