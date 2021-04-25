<template>
	<div id="api-page-choice">
		<h1>MSS project's API</h1>
		<h3>We have an option for you:</h3>
		<div id="choice">
			<router-link to="/docs/api/swagger" class="choice__card">
				<div class="choice__card__header default-header"><router-link to="/docs/api/swagger">Swagger</router-link></div>
				<div class="choice__card__content">
					<p>For better models and testing &amp; mocking.</p>
				</div>
			</router-link>
			<a href="/docs/api/redoc" class="choice__card">
				<div class="choice__card__header default-header"><a href="/docs/api/redoc">Redoc</a></div>
				<div class="choice__card__content">
					<p>For better response viewing.</p>
				</div>
			</a>
		</div>
	</div>
</template>

<script>
export default {
	name: "API"
}
</script>

<style scoped>
#api-page-choice {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

#api-page-choice h1,
#api-page-choice h3 {
	text-align: center;
}

#choice {
	display: flex;
	flex-direction: row;
	justify-content: center;
	flex-wrap: wrap;

	width: 100%;
	max-width: 1000px;

	margin: 0 auto;
	padding: 32px 0;
}

.choice__card {
	display: block;
	position: relative;
	
	width: fit-content;
	margin: 16px;
	padding: 16px;
	box-sizing: border-box;

	border-radius: 8px;
	background-color: var(--card-color);
	color: var(--text-color);
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);

	transition: box-shadow 150ms ease-in-out 0s;
	text-decoration: none;
}

.choice__card:hover {
	box-shadow: 0 1px 6px 2px rgba(100, 100, 100, 0.2);
}

.choice__card__header {
	text-align: left;
	margin-bottom: 0.5em;
}
</style>