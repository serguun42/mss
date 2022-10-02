<template>
	<div class="group-small-cards" ref="container">
		<router-link
			class="group-small-cards__card"
			v-for="(group, groupIndex) in groups"
			:key="`card-${groupIndex}`"
			:to="`/group?name=${group.groupName}${group.groupSuffix ? '&suffix=' + group.groupSuffix : ''}`"
		>
			<div class="group-small-cards__card__name">{{ group.groupName }}</div>
			<div class="group-small-cards__card__suffix" v-if="group.groupSuffix">{{ group.groupSuffix }}</div>
		</router-link>
	</div>
</template>

<script>
import Masonry from "@/utils/masonry";

export default {
	name: "group-small-cards",
	props: {
		groups: Array
	},
	data() {
		return {
			/** @type {import("../types/masonry").Masonry} */
			masonry: null
		};
	},
	methods: {
		updateMasonry() {
			const container = this.$refs["container"];
			if (!(container instanceof HTMLElement)) return;

			this.masonry = new Masonry({
				baseWidth: 150,
				container,
				minify: true,
				gutterX: 8,
				gutterY: 8,
				ultimateGutter: 8
			});
		}
	},
	updated() {
		this.$nextTick(() => this.updateMasonry());
	},
	beforeDestroy() {
		if (this.masonry) this.masonry.destroy();
	}
};
</script>

<style scoped>
.group-small-cards {
	display: block;
	position: relative;

	width: 100%;
}

.group-small-cards__card {
	display: block;
	position: absolute;

	margin: 0;
	padding: 16px;
	box-sizing: border-box;

	font-size: 20px;
	font-weight: 500;
	line-height: 20px;
	color: var(--text-color);

	background-color: var(--card-color);
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);
	border-radius: 8px;

	transition: box-shadow 150ms ease-in-out 0s;
	text-decoration: none;
}

.group-small-cards__card:hover {
	box-shadow: 0 1px 6px 2px rgba(100, 100, 100, 0.2);
}

.group-small-cards__card__name {
	color: var(--card-accent-color);
}

.group-small-cards__card__suffix {
	font-size: 16px;
	color: var(--card-faded-color);
}
</style>
