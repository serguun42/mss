<template>
	<div
		id="message"
		class="default-extra-bold default-no-select default-pointer"
		:class="{'is-shown': $store.getters.message.shown}"
		@click="messageOnclick"
	>
		{{ $store.getters.message.text }}
	</div>
</template>

<script>
import store from "@/store";
export default {
	methods: {
		messageOnclick() {
			store.dispatch("hideMessage");
		}
	}
}
</script>

<style scoped>
#message {
	display: block;
	position: fixed;

	width: 100%;
	height: 52px;
	top: -200px;
	left: 0;

	margin: 0;
	padding: 14px;
	box-sizing: border-box;

	font-weight: 700;
	font-size: 18px;
	line-height: 24px;

	box-shadow: 0 1px 4px 1px rgb(100, 100, 100, 0.1);
	background-color: var(--navigation-background-color);
	color: var(--navigation-text-color);
	text-align: center;

	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	z-index: 10;

	transition: top 400ms ease-in-out 0s;
}

#message.is-shown {
	top: 0;
}

@media (min-width: 600px) {
	#message {
		width: 600px;
		height: 60px;
		left: calc(50% - 300px);

		margin: 0;
		padding: 20px;
		box-sizing: border-box;

		font-size: 18px;
		line-height: 20px;

		border-radius: 30px;
	}

	#message.is-shown {
		top: 16px;
	}
}
</style>