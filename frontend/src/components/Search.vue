<template>
	<div :class="{
		'search-container': true,
		'search-container--bigger': bigger,
		'search-container--expanded': showingPrompts && showingPrompts.length
	}">
		<div class="search-container__textfield">
			<input
				class="search-container__textfield__input"
				type="text"
				ref="actual-input"
				:placeholder="placeholder"
				v-model="seeking.raw"
			>
			<div class="search-container__textfield__clear-button default-no-select default-pointer" v-ripple @click="clearInput">
				<i class="material-icons material-icons-round">close</i>
			</div>
		</div>
		<div
			:class="{
				'search-container__prompts-list': true,
				'is-hidden': !(showingPrompts && showingPrompts.length)
			}"
			:style="{
				'height': showingPrompts && showingPrompts.length ? (showingPrompts.slice(0, 6).length * (bigger ? 48 : 32) + 8) + 'px' : '0px'
			}"
		>
			<div
				class="search-container__prompts-list__item default-no-select default-pointer"
				v-for="(prompting, promptingIndex) in showingPrompts"
				:key="`search-container__prompts-list__item-${promptingIndex}`"
				v-ripple
				@click="chooseOne(prompting)"
			>{{ prompting.stringified || prompting }}</div>
		</div>
	</div>
</template>

<script>
const CYRILLIC = [
	"ё","й","ц","у","к","е","н","г","ш","щ","з","х","ъ","ф","ы","в","а","п","р","о","л","д","ж","э","я","ч","с","м","и","т","ь","б","ю",
	"Ё","Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ъ","Ф","Ы","В","А","П","Р","О","Л","Д","Ж","Э","Я","Ч","С","М","И","Т","Ь","Б","Ю"
];

const LATIN = [
	"`","q","w","e","r","t","y","u","i","o","p","[","]","a","s","d","f","g","h","j","k","l",";","'","z","x","c","v","b","n","m",",",".",
	"~","Q","W","E","R","T","Y","U","I","O","P","{","}","A","S","D","F","G","H","J","K","L",":",'"',"Z","X","C","V","B","N","M","<",">"
];


/**
 * @param {string} raw
 * @returns {string}
 */
const SmartReplace = (raw) => {
	if (typeof raw !== "string") return raw;

	const replacedByChar = raw
		.split("")
		.map((char) => {
			const latinIndex = LATIN.indexOf(char);
			if (latinIndex === -1) return char;

			return CYRILLIC[latinIndex];
		})
		.join("");

	return replacedByChar
		.replace(/[\-_\()]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}


export default {
	name: "search",
	props: {
		seeking: Object,
		prompts: Array,
		placeholder: {
			type: String,
			default: "Найти…"
		},
		bigger: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		"seeking.raw": function (newRaw) {
			this.seeking.parsed = SmartReplace(newRaw || "");
			this.showingPrompts = this.seeking.parsed
				? this.prompts.filter((prompting) =>
					SmartReplace(prompting.stringified).indexOf(this.seeking.parsed) > -1
				).slice(0, 6) 
				: [];
		}
	},

	data() {
		return {
			showingPrompts: []
		}
	},
	methods: {
		clearInput() {
			this.seeking.raw = "";
			this.seeking.parsed = "";
			this.$refs["actual-input"].value = "";
		},
		chooseOne(chosen) {
			this.$emit("search-on-choose", chosen.raw || chosen);
		}
	}
}
</script>

<style scoped>
.search-container {
	display: block;
	position: relative;

	margin: 0;
	padding: 0;
	box-sizing: border-box;

	box-shadow: 0 0 3px 1px var(--navigation-shadow-color);
	border-radius: 20px;

	background-color: var(--search-background-color);
	color: var(--search-text-color);

	transition: border-radius 150ms ease-in-out 0s;
}

.search-container--bigger {
	border-radius: 32px;
}

.search-container--expanded {
	border-radius: 20px 20px 0 0;
	transition: border-radius 150ms ease-in-out 0s;
}

.search-container--bigger.search-container--expanded {
	border-radius: 32px 32px 0 0;
}

.search-container__textfield {
	display: block;
	position: relative;

	width: 100%;
	height: 40px;

	border-radius: 20px;

	background-color: var(--search-background-color);

	z-index: 2;
}

.search-container--bigger .search-container__textfield {
	height: 64px;

	border-radius: 32px;
}

.search-container__textfield__input {
	display: block;
	position: relative;

	width: calc(100% - 48px * 2);
	height: 40px;

	margin: 0 48px;
	padding: 12px 0;
	box-sizing: border-box;

	font-family: "Manrope", "Roboto", "Arial", "Helvetica", sans-serif;
	font-size: 16px;
	font-weight: 700;
	line-height: 1em;
	text-align: center;
	color: var(--search-text-color);

	background-color: transparent;
	border: none;
	outline: none;
}

.search-container--bigger .search-container__textfield__input {
	height: 64px;

	padding: 20px 0;
	
	font-size: 24px;
	line-height: 1em;
}

.search-container__textfield__input:focus,
.search-container__textfield__input:active {
	outline: none;
}

.search-container__textfield__clear-button {
	display: block;
	position: absolute;

	width: 36px;
	height: 36px;

	top: 2px;
	right: 8px;

	margin: 0;
	padding: 6px;
	box-sizing: border-box;

	border-radius: 18px;

	color: var(--search-text-color);
	transition: color 150ms ease-in-out;
}

.search-container--bigger .search-container__textfield__clear-button {
	width: 56px;
	height: 56px;

	top: 4px;
	right: 8px;
	padding: 16px;

	border-radius: 28px;
}

.search-container__textfield__clear-button:hover {
	color: var(--accent-color);
}

.search-container__textfield__clear-button:focus,
.search-container__textfield__clear-button:active {
	color: var(--primary-color);
}

.search-container__prompts-list {
	display: block;
	position: absolute;

	width: 100%;

	margin: 0;
	padding: 0 0 8px;
	box-sizing: border-box;

	box-shadow: 0 3px 3px 1px var(--navigation-shadow-color);
	border-radius: 0 0 20px 20px;

	background-color: var(--search-background-color);

	overflow: hidden;

	transition:
				transform 150ms ease-in-out 0s,
				padding 150ms ease-in-out 0s,
				height 150ms ease-in-out 0s,
				box-shadow 150ms ease-in-out 0s;

	z-index: 1;
}

.search-container__prompts-list.is-hidden {
	transform: translateY(-20px);
	padding: 0;
	box-shadow: 0 0 0 0 transparent;
}

.search-container__prompts-list__item {
	display: block;
	position: relative;

	width: 100%;
	height: 32px;

	margin: 0;
	padding: 8px 16px;
	box-sizing: border-box;

	font-family: "Manrope", "Roboto", "Arial", "Helvetica", sans-serif;
	font-size: 18px;
	font-weight: 700;
	line-height: 16px;
	text-align: left;
	color: var(--search-prompt-color);
}

.search-container--bigger .search-container__prompts-list__item {
	height: 48px;

	padding: 12px 16px;

	font-size: 20px;
	line-height: 24px;
}
</style>