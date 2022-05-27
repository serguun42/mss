<template>
	<div id="all-groups-page">
		<h1 id="all-groups-page__title" class="default-no-select">Все группы</h1>
		<search
			id="all-groups-page__search"
			:seeking="seeking"
			:prompts="(groups || []).map((group) => ({ raw: group, stringified: group.groupSuffix ? `${group.groupName} (${group.groupSuffix})` : group.groupName }))"
			@search-on-choose="searchOnChoose"
		></search>
		<groups-small-cards id="all-groups-page__cards" :groups="[...groups]"></groups-small-cards>
	</div>
</template>

<script>
import Search from "@/components/Search.vue"
import GroupsSmallCards from "@/components/GroupsSmallCards.vue"
import router from "@/router"
import { GetAllGroups } from "@/utils/api"
import Dispatcher from "@/utils/dispatcher"

export default {
	name: "all-groups",
	components: {
		Search,
		GroupsSmallCards
	},
	data() {
		return {
			groups: [],
			seeking: {
				raw: "",
				parsed: ""
			}
		}
	},
	methods: {
		searchOnChoose(result) {
			router.push({ path: `/group?name=${result.groupName}${result.groupSuffix ? `&suffix=${result.groupSuffix}` : ""}` });
		}
	},
	created() {
		Dispatcher.call("preload");

		GetAllGroups()
			.then((groups) => this.groups = groups)
			.catch(console.warn)
			.finally(() => Dispatcher.call("preloadingDone"));
	}
}
</script>

<style scoped>
#all-groups-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

#all-groups-page__title {
	text-align: center;
}

#all-groups-page__search {
	display: block;
	position: relative;

	width: calc(100% - 32px);
	max-width: 600px;
	margin: 2em auto 1em;

	z-index: 2;
}

#all-groups-page__cards {
	width: calc(100% - 16px);
	max-width: 1000px;
	margin: 2em auto 1em;

	z-index: 1;
}
</style>