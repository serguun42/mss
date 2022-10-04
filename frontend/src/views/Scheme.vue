<template>
	<div id="scheme">
		<div class="scheme__viewer default-pointer default-no-select" ref="viewer"></div>
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
				<div class="scheme__controls__zoom default-pointer" v-ripple @click="zoomOut">-</div>
			</div>
		</div>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
import { LoadAssets } from "@/utils/map";

export default {
	name: "scheme",
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
			moving: false,
			startX: 0,
			startY: 0,
			transformX: 0,
			transformY: 0,
			SCALE_STEP: 1.5,
			scale: 1,
			startTransformX: 0,
			startTransformY: 0,
		};
	},

	created() {
		Dispatcher.call("preload");

		Dispatcher.link("themeChanged", this.onThemeChanged);

		LoadAssets()
			.then((floors) => {
				this.floors = floors;
				this.buildViewer();
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

		buildViewer() {
			this.unsetListeners();

			if (!this.viewer) this.viewer = this.$refs.viewer;
			if (!(this.viewer instanceof HTMLElement)) return;

			this.viewer.innerHTML = this.floors[this.selectedFloor][this.colorScheme].svgPlain;
			this.$nextTick(() => {
				if (!this.svg) {
					this.svg = this.viewer.querySelector("svg");
					const viewerRect = this.viewer.getBoundingClientRect();
					const svgRect = this.svg.getBoundingClientRect();

					const newScale = svgRect.height < svgRect.width
						? viewerRect.height / svgRect.height * 0.85
						: viewerRect.width / svgRect.width * 0.85;

					this.transformX = 0;
					this.transformY = (viewerRect.height - svgRect.height) / 2;
					this.scale = Math.min(newScale, window.innerWidth < 800 ? 4 : 3);
					this.applyStyle();
				} else {
					this.svg = this.viewer.querySelector("svg");
					this.applyStyle();
				}

				this.setListeners();
			});
		},
		setListeners() {
			if (!this.viewer) this.viewer = this.$refs.viewer;
			if (!(this.viewer instanceof HTMLElement)) return;

			if ("ontouchstart" in window) {
				this.viewer.addEventListener("touchstart", this.onDown);
				this.viewer.addEventListener("touchmove", this.onMove);
				this.viewer.addEventListener("touchend", this.onLeave);
				this.viewer.addEventListener("touchcancel", this.onLeave);
			} else {
				this.viewer.addEventListener("mousedown", this.onDown);
				this.viewer.addEventListener("mousemove", this.onMove);
				this.viewer.addEventListener("mouseup", this.onLeave);
				this.viewer.addEventListener("mouseleave", this.onLeave);
				this.viewer.addEventListener("dblclick", this.zoomIn);
			}

			this.viewer.addEventListener("wheel", this.onWheel);
		},
		unsetListeners() {
			if (!this.viewer) return;

			this.viewer.removeEventListener("touchstart", this.onDown);
			this.viewer.removeEventListener("touchmove", this.onMove);
			this.viewer.removeEventListener("touchend", this.onLeave);
			this.viewer.removeEventListener("touchcancel", this.onLeave);
			this.viewer.removeEventListener("mousedown", this.onDown);
			this.viewer.removeEventListener("mousemove", this.onMove);
			this.viewer.removeEventListener("mouseup", this.onLeave);
			this.viewer.removeEventListener("mouseleave", this.onLeave);
			this.viewer.removeEventListener("dblclick", this.zoomIn);
			this.viewer.removeEventListener("wheel", this.onWheel);
		},


		applyStyle() {
			requestAnimationFrame(() =>
				this.svg.style.transform = `translate(${this.transformX}px, ${this.transformY}px) scale(${this.scale})`
			);
		},

		/** @param {MouseEvent | TouchEvent} e */
		onDown(e) {
			this.moving = true;

			/** @type {number} */
			const x = e.changedTouches
				? e.changedTouches[0].clientX
				: e.touches
				? e.touches[0].clientX
				: e.clientX;

			/** @type {number} */
			const y = e.changedTouches
				? e.changedTouches[0].clientY
				: e.touches
				? e.touches[0].clientY
				: e.clientY;


			this.startX = x;
			this.startY = y;
			this.startTransformX = this.transformX;
			this.startTransformY = this.transformY;

			if (!this.svg) this.svg = this.viewer.querySelector("svg");
			this.applyStyle();
		},
		/** @param {MouseEvent | TouchEvent} e */
		onMove(e) {
			if (!this.moving) return;

			/** @type {number} */
			const x = e.changedTouches
				? e.changedTouches[0].clientX
				: e.touches
				? e.touches[0].clientX
				: e.clientX;

			/** @type {number} */
			const y = e.changedTouches
				? e.changedTouches[0].clientY
				: e.touches
				? e.touches[0].clientY
				: e.clientY;

			const changingX = x - this.startX;
			const changingY = y - this.startY;

			this.transformX = this.startTransformX + changingX;
			this.transformY = this.startTransformY + changingY;

			if (!this.svg) this.svg = this.viewer.querySelector("svg");
			this.applyStyle();
		},
		/** @param {MouseEvent | TouchEvent} e */
		onLeave() {
			this.moving = false;
		},
		/** @param {WheelEvent} e */
		onWheel(e) {
			if (e.deltaX > 0) this.transformX -= 100;
			else if (e.deltaX < 0) this.transformX += 100;

			if (e.deltaY > 0) this.zoomOut(e);
			else if (e.deltaY < 0) this.zoomIn(e);

			this.applyStyle();
		},

		/** @param {MouseEvent | WheelEvent} e */
		zoomIn(e) {
			this.scale = Math.max(this.scale *= this.SCALE_STEP, 0.5);
			this.applyStyle();
		},
		/** @param {MouseEvent | WheelEvent} e */
		zoomOut(e) {
			this.scale = Math.max(this.scale /= this.SCALE_STEP, 0.5);
			this.applyStyle();
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
	background-color: #FFF;
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

.scheme__viewer svg {
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
	padding: 12px 0;
	box-sizing: border-box;

	font-weight: 400;
	font-size: 16px;
	line-height: 18px;
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
	padding: 12px 0;
	box-sizing: border-box;

	font-weight: 400;
	font-size: 16px;
	line-height: 18px;
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

		right: 0;
		bottom: 62px;
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
</style>
