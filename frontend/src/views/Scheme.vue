<template>
	<div id="scheme">
		<div class="scheme__viewer default-pointer default-no-select" ref="viewer"></div>
		<div class="scheme__search">
			<input
				class="scheme__search__input"
				type="text"
				ref="search-input"
				placeholder="Поиск аудитории"
				v-model="seeking"
			>
			<div class="scheme__search__clear default-no-select default-pointer" v-ripple @click="clearInput">
				<i class="material-icons material-icons-round">close</i>
			</div>
			<div class="scheme__search__results" v-show="found && found.length">
				<div
					class="scheme__search__result default-pointer"
					v-for="result in found"
					:key="result.id || result.name"
					v-text="result.name"
					v-ripple
					@click="gotoFoundRoom(result)"
				></div>
			</div>
		</div>
		<div class="scheme__controls default-no-select">
			<div class="scheme__controls__floors">
				<div
					:class="{
						'scheme__controls__floor default-pointer': true,
						'scheme__controls__floor--selected': floorIndex === selectedFloor
					}"
					v-for="(_, floorIndex) in floors"
					:key="floorIndex"
					v-text="floorIndex"
					v-ripple
					@click="selectFloor(floorIndex)"
				></div>
			</div>
			<div class="scheme__controls__zooms">
				<div class="scheme__controls__zoom default-pointer" v-ripple @click="zoomIn">+</div>
				<div class="scheme__controls__zoom default-pointer" v-ripple @click="reset">
					<i class="material-icons material-icons-round">restart_alt</i>
				</div>
				<div class="scheme__controls__zoom default-pointer" v-ripple @click="zoomOut">-</div>
			</div>
		</div>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
import { LoadAssets, RoomNameToId } from "@/utils/map";
import Panzoom from "@panzoom/panzoom";

const CYRILLIC = [
	"ё","й","ц","у","к","е","н","г","ш","щ","з","х","ъ","ф","ы","в","а","п","р","о","л","д","ж","э","я","ч","с","м","и","т","ь","б","ю",
	"Ё","Й","Ц","У","К","Е","Н","Г","Ш","Щ","З","Х","Ъ","Ф","Ы","В","А","П","Р","О","Л","Д","Ж","Э","Я","Ч","С","М","И","Т","Ь","Б","Ю"
];

const LATIN = [
	"`","q","w","e","r","t","y","u","i","o","p","[","]","a","s","d","f","g","h","j","k","l",";","'","z","x","c","v","b","n","m",",",".",
	"~","Q","W","E","R","T","Y","U","I","O","P","{","}","A","S","D","F","G","H","J","K","L",":",'"',"Z","X","C","V","B","N","M","<",">"
];

export default {
	name: "scheme",

	props: {
		seekingRoom: {
			type: String,
			required: false
		}
	},
	data() {
		return {
			/** @type {import("@/types/map").Floor[]} */
			floors: [],
			/** @type {import("@/types/map").FloorColorScheme} */
			colorScheme: this.$store.getters.theme?.dark ? "dark" : "light",
			selectedFloor: 2,

			/** @type {HTMLElement} */
			viewer: null,
			/** @type {SVGElement} */
			svg: null,
			/** @type {import("@panzoom/panzoom").PanzoomObject} */
			panzoom: null,
			SCALE_STEP: 0.5,
			SCALE_MIN: 0.5,
			SCALE_MAX: 10,

			seeking: "",
			/** @type {{ name: string, id: string, floorIndex: number }[]} */
			found: [],
		};
	},
	watch: {
		/** @param {string} query */
		seeking(query) {
			this.found = this.searchByRoomName(query);
		}
	},

	created() {
		Dispatcher.call("preload");

		Dispatcher.link("themeChanged", this.onThemeChanged);

		LoadAssets()
			.then((floors) => {
				this.floors = floors;

				if (this.seekingRoom) {
					const replacedUrl = new URL(this.$route.path, window.location.origin);
					replacedUrl.search = "";
					history.replaceState({}, null, replacedUrl);

					const room = this.searchByRoomName(this.seekingRoom)?.[0];
					if (room?.id) this.gotoFoundRoom(room);
					else this.buildViewer();
				} else this.buildViewer();
			})
			.catch(console.warn)
			.finally(() => Dispatcher.call("preloadingDone"));
	},
	beforeDestroy() {
		Dispatcher.unlink("themeChanged", this.onThemeChanged);
		this.unsetListeners();
	},

	methods: {
		onThemeChanged() {
			this.colorScheme = this.$store.getters.theme?.dark ? "dark" : "light";
			this.buildViewer();
		},
		selectFloor(newFloor) {
			this.selectedFloor = newFloor;
			this.buildViewer();
		},

		/**
		 * @param {string} query
		 * @returns {{ name: string, id: string, floorIndex: number }[]}
		 */
		searchByRoomName(query) {
			if (!query) query = "";

			const replacedByChar = query.split("").map((char) => {
				const latinIndex = LATIN.indexOf(char);
				if (latinIndex === -1) return char;

				return CYRILLIC[latinIndex];
			}).join("");

			const queryRegex = new RegExp(
				replacedByChar.toLowerCase()
				.replace(/[^а-яёa-z\d]/gi, "")
				.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&")
			);

			const strictlyEqual = this.floors.map((floor, floorIndex) =>
				floor[this.colorScheme].rooms.filter((roomName) =>
					replacedByChar.replace(/[^а-яёa-z\d]/gi, "").toLowerCase() ===
					roomName.replace(/[^а-яёa-z\d]/gi, "").toLowerCase()
				).map((roomName) => ({
					name: roomName,
					id: RoomNameToId(roomName),
					floorIndex
				}))
			).flat();

			const vaguelyEqual = this.floors.map((floor, floorIndex) =>
				floor[this.colorScheme].rooms.filter((roomName) =>
					replacedByChar && queryRegex.test(roomName.toLowerCase().replace(/[^а-яёa-z\d]/gi, ""))
				).map((roomName) => ({
					name: roomName,
					id: RoomNameToId(roomName),
					floorIndex
				}))
			).flat();

			return strictlyEqual.concat(vaguelyEqual)
			.filter((room, index, array) => index === array.findIndex((matching) => matching.id === room.id))
			.slice(0, 5);
		},
		clearInput() {
			this.seeking = "";
			this.$refs["search-input"].value = "";
		},

		/**
		 * @param {{ name: string, id: string, floorIndex: number }} room
		 * @returns {void}
		 */
		gotoFoundRoom(room) {
			this.seeking = "";
			this.selectFloor(room.floorIndex);
			this.$nextTick(() => setTimeout(() => {
				if (!room.id) return;

				/** @type {SVGGraphicsElement} */
				const foundPathInSVG = this.svg.querySelector(`#${room.id}`);
				if (!foundPathInSVG) return;

				const rect = foundPathInSVG.getBoundingClientRect();
				this.panzoom.zoomToPoint(
					this.SCALE_MAX - 2,
					{
						clientX: rect.x + rect.width,
						clientY: rect.y + rect.height
					},
					{ animate: false }
				);
				foundPathInSVG.classList.add("svg-room-animating");
			}, 50));
		},

		reset() {
			this.selectFloor(2);
		},

		buildViewer() {
			this.unsetListeners();

			if (!this.viewer) this.viewer = this.$refs.viewer;
			if (!(this.viewer instanceof HTMLElement)) return;

			this.viewer.innerHTML = this.floors[this.selectedFloor][this.colorScheme].svgPlain;
			this.$nextTick(() => {
				this.svg = this.viewer.querySelector("svg");
				this.setListeners();
			});
		},
		setListeners() {
			if (!this.viewer) this.viewer = this.$refs.viewer;
			if (!(this.viewer instanceof HTMLElement)) return;

			this.panzoom = Panzoom(this.svg, {
				transformOrigin: { x: 0.5, y: 0.5 },
				pinchAndPan: true,
				minScale: this.SCALE_MIN,
				maxScale: this.SCALE_MAX,
				step: this.SCALE_STEP
			});

			this.panzoom.setStyle("position", "absolute");
			this.panzoom.setStyle("width", "100%");
			this.panzoom.setStyle("height", "100%");
			this.panzoom.setStyle("left", "0");
			this.panzoom.setStyle("top", "0");

			this.viewer.addEventListener("dblclick", this.zoomIn);
			this.viewer.addEventListener("wheel", this.onWheel);
		},
		unsetListeners() {
			if (this.panzoom) this.panzoom.destroy();

			if (!this.viewer) return;
			this.viewer.removeEventListener("dblclick", this.zoomIn);
			this.viewer.removeEventListener("wheel", this.onWheel);
		},

		/** @param {WheelEvent} e */
		onWheel(e) {
			if (e.deltaY > 0) this.zoomOut(e);
			else if (e.deltaY < 0) this.zoomIn(e);
		},

		zoomIn() {
			this.panzoom.zoomIn();
		},
		zoomOut() {
			this.panzoom.zoomOut();
		}
	}
};
</script>

<style scoped>
#scheme {
	display: block;
	position: relative;

	margin: 0;
	padding: 0;
	box-sizing: border-box;

	width: 100%;
	min-height: 100vh;

	overflow: hidden;
}

.is-dark #scheme {
	background-color: transparent;
}

.scheme__viewer {
	display: block;
	position: absolute;

	width: 100%;
	height: 100%;

	cursor: grabbing;
}

.scheme__viewer > svg {
	display: block;
	position: absolute;

	width: 100%;
	height: 100%;

	top: 0;
	left: 0;

	transform-origin: center center;
}

.scheme__controls {
	display: block;
	position: fixed;

	right: 10px;
	bottom: 80px;
}

@media (max-width: 800px) {
	.scheme__controls {
		bottom: 70px;
	}
}

.scheme__controls__floors {
	display: block;
	position: absolute;

	right: 0;
	bottom: 0;

	border-radius: 8px;
	box-shadow: 0 0 3px 1px var(--navigation-shadow-color);
}

.scheme__controls__floor {
	display: block;
	position: relative;

	width: 42px;
	height: 42px;

	margin: 0;
	padding: 9px 0;
	box-sizing: border-box;

	font-weight: 400;
	font-size: 16px;
	line-height: 24px;
	text-align: center;

	color: var(--navigation-text-color);
	background-color: var(--navigation-background-color);
}

.scheme__controls__floor:first-child {
	border-radius: 8px 8px 0 0;
}

.scheme__controls__floor:last-child {
	border-radius: 0 0 8px 8px;
}

.scheme__controls__floor--selected {
	font-weight: 700;

	color: #FFF;
	background-color: var(--primary-color);
}

.scheme__controls__zooms {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: flex-start;
	align-items: center;
	position: absolute;

	right: 52px;
	bottom: 0;

	border-radius: 8px;
	box-shadow: 0 0 3px 1px var(--navigation-shadow-color);
}

.scheme__controls__zoom {
	display: block;
	position: relative;

	width: 42px;
	height: 42px;

	margin: 0;
	padding: 9px 0;
	box-sizing: border-box;

	font-weight: 400;
	font-size: 24px;
	line-height: 24px;
	text-align: center;

	color: var(--navigation-text-color);
	background-color: var(--navigation-background-color);
}

.scheme__controls__zoom:first-child {
	border-radius: 8px 0 0 8px;
}

.scheme__controls__zoom:last-child {
	border-radius: 0 8px 8px 0;
}

@media (max-width: 800px) {
	.scheme__controls__zooms {
		display: block;

		right: calc(100vw - 62px);
		bottom: 0;
	}

	.scheme__controls__zoom:first-child {
		border-radius: 8px 8px 0 0;
	}

	.scheme__controls__zoom:last-child {
		border-radius: 0 0 8px 8px;
	}

	.scheme__controls__floors {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: center;
		position: absolute;
	}

	.scheme__controls__floor:first-child {
		border-radius: 8px 0 0 8px;
	}

	.scheme__controls__floor:last-child {
		border-radius: 0 8px 8px 0;
	}
}

.scheme__search {
	display: block;
	position: fixed;

	width: calc(100% - 20px);
	max-width: 500px;

	top: 10px;
	left: 50%;
	transform: translateX(-50%);

	color: var(--navigation-text-color);
	background-color: var(--navigation-background-color);

	border-radius: 20px;
	box-shadow: 0 0 3px 1px var(--navigation-shadow-color);
}

.scheme__search__input {
	display: block;
	position: relative;

	width: 100%;
	height: 40px;

	margin: 0;
	padding: 12px 0;
	box-sizing: border-box;

	font-family: "Manrope", "Roboto", "Arial", "Helvetica", sans-serif;
	font-size: 16px;
	font-weight: 700;
	line-height: 1em;
	text-align: center;
	color: var(--navigation-text-color);

	background-color: transparent;
	border: none;
	outline: none;
}

.scheme__search__clear {
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

	color: var(--navigation-text-color);
	transition: color 150ms ease-in-out;
}

.scheme__search__clear:hover {
	color: var(--accent-color);
}

.scheme__search__clear:focus,
.scheme__search__clear:active {
	color: var(--primary-color);
}

.scheme__search__results {
	display: block;
}

.scheme__search__result {
	display: block;
	position: relative;

	width: 100%;
	height: 36px;

	margin: 0;
	padding: 10px 24px;
	box-sizing: border-box;

	font-size: 16px;
	line-height: 16px;
	font-weight: 700;
	text-align: left;

	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	color: var(--navigation-text-color);
}
</style>
