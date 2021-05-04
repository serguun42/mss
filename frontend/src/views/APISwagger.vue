<template>
	<div id="api-page-swagger">	</div>
</template>

<script>
import SwaggerUI from "swagger-ui";
import "swagger-ui/dist/swagger-ui.css";
import Dispatcher from "@/utils/dispatcher";

export default {
	name: "APISwagger",
	mounted() {
		SwaggerUI({
			url: "/docs/api/v1.1.yml",
			dom_id: "#api-page-swagger"
		})
	},
	created() {
		Dispatcher.call("preloadingDone");
	}
}
</script>

<style scoped>
#api-page-swagger {
	display: block;
	position: relative;

	padding: 0;
	margin: 0;
	box-sizing: border-box;

	background-color: #F1F1F1;

	overflow: hidden;
}
</style>