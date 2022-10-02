/**
 * MiniMasonry.js modified by serguun42
 *
 * @see https://github.com/Spope/MiniMasonry.js/blob/master/src/minimasonry.js
 * @author Spope
 * @license MIT
 */

/** @type {import("../types/masonry").MasonryConfig} */
class Masonry {
	/** @type {import("../types/masonry").MasonryConfig} */
	static DEFAULT_CONFIG = Object.freeze({
		baseWidth: 255,
		gutterX: null,
		gutterY: null,
		gutter: 10,
		container: null,
		minify: true,
		ultimateGutter: 5,
		surroundingGutter: true,
		direction: "ltr",
		wedge: false
	});

	/** @type {import("../types/masonry").MasonryConfig} */
	_conf = null;

	/**
	 * Heights of all individual children
	 * @type {number[]}
	 */
	_individualHeights = [];
	/**
	 * Heights of combined columns
	 * @type {number[]}
	 */
	_columnsHeights = [];
	/** @type {HTMLElement} */
	_container = null;
	/** @type {number} */
	_columnsCount = 0;
	_width = 0;
	/** @type {() => void} */
	_removeListener = null;
	/** @type {number} */
	_resizeTimeout = null;

	/**
	 * @param {import("../types/masonry").MasonryConfig} conf
	 */
	constructor(conf) {
		this._conf = { ...Masonry.DEFAULT_CONFIG, ...conf };

		if (!this._conf.gutterX) this._conf.gutterX = this._conf.gutter;
		if (!this._conf.gutterY) this._conf.gutterY = this._conf.gutter;

		this._container =
			this._conf.container instanceof HTMLElement
				? this._conf.container
				: document.querySelector(this._conf.container);

		if (!this._container) throw new Error("Container not found or missing");

		const onResize = () => this.resizeThrottler();
		window.addEventListener("resize", onResize);
		this._removeListener = () => window.removeEventListener("resize", onResize);

		this.buildLayout();
	}

	reset() {
		this._individualHeights = [];
		this._columnsHeights = [];
		this._columnsCount = 0;
		this._width = this._container.clientWidth;

		const minWidth = this._conf.baseWidth;

		if (this._width < minWidth) {
			this._width = minWidth;
			this.setStyle(this._container, { minWidth: minWidth + "px" });
		}

		if (this.getColumnsCount() === 1) {
			// Set ultimate gutter when only one column is displayed
			this._conf.gutterX = this._conf.ultimateGutter;
			// As gutters are reduced, two column may fit, forcing to 1
			this._columnsCount = 1;
		}

		// Remove gutter when screen is to low
		if (this._width < this._conf.baseWidth + 2 * this._conf.gutterX) this._conf.gutterX = 0;
	}

	/**
	 * Set styles thourgh vanilla JS or with Vue
	 * @param {HTMLElement} elem
	 * @param {Partial<CSSStyleDeclaration>} styles
	 */
	setStyle(elem, styles) {
		if (elem.__vue__ && typeof elem.__vue__?.saveStyle === "function") elem.__vue__.saveStyle(styles);

		Object.keys(styles).forEach((styleName) => (elem.style[styleName] = styles[styleName]));
	}

	/**
	 * Get count of columns
	 * @returns {number}
	 */
	getColumnsCount() {
		if (this._conf.surroundingGutter)
			return Math.floor((this._width - this._conf.gutterX) / (this._conf.baseWidth + this._conf.gutterX));

		return Math.floor((this._width + this._conf.gutterX) / (this._conf.baseWidth + this._conf.gutterX));
	}

	/**
	 * Compute width for single column
	 * @returns {number}
	 */
	computeWidth() {
		const width = this._conf.surroundingGutter
			? (this._width - this._conf.gutterX) / this._columnsCount - this._conf.gutterX
			: (this._width + this._conf.gutterX) / this._columnsCount - this._conf.gutterX;

		return Number.parseFloat(width.toFixed(2));
	}

	buildLayout() {
		if (!this._container) return console.error("Container not found");

		this.reset();

		// Computing columns count
		if (!this._columnsCount) this._columnsCount = this.getColumnsCount();

		// Computing columns width
		const columnWidth = this.computeWidth();
		for (let i = 0; i < this._columnsCount; i++) this._columnsHeights[i] = 0;

		/**
		 * Saving children real heights
		 * @type {HTMLElement[]}
		 */
		const children = Array.from(this._container.children);

		children.forEach((child, index) => {
			this.setStyle(child, { width: columnWidth + "px" });
			this._individualHeights[index] = child.clientHeight;
		});

		let startX =
			this._conf.direction === "ltr"
				? this._conf.surroundingGutter
					? this._conf.gutterX
					: 0
				: this._width - (this._conf.surroundingGutter ? this._conf.gutterX : 0);

		if (this._columnsCount > this._individualHeights.length) {
			// If more columns than children
			const occupiedSpace =
				this._individualHeights.length * (columnWidth + this._conf.gutterX) - this._conf.gutterX;

			if (!this._conf.wedge) {
				if (this._conf.direction === "ltr") startX = (this._width - occupiedSpace) / 2;
				else startX = this._width - (this._width - occupiedSpace) / 2;
			} else if (this._conf.direction !== "ltr") startX = this._width - this._conf.gutterX;
		}

		// Computing position of children
		children.forEach((child, index) => {
			const nextColumn = this._conf.minify ? this.getShortest() : this.getNextColumn(index);

			let childrenGutter = 0;
			if (this._conf.surroundingGutter || nextColumn !== this._columnsHeights.length)
				childrenGutter = this._conf.gutterX;

			let x = 0;
			if (this._conf.direction === "ltr") x = startX + (columnWidth + childrenGutter) * nextColumn;
			else x = startX - (columnWidth + childrenGutter) * nextColumn - columnWidth;

			let y = this._columnsHeights[nextColumn];

			this.setStyle(child, { transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)` });

			this._columnsHeights[nextColumn] +=
				this._individualHeights[index] +
				(this._columnsCount > 1 ? this._conf.gutterY : this._conf.ultimateGutter); // margin-bottom
		});

		this.setStyle(this._container, { height: this._columnsHeights[this.getLongest()] - this._conf.gutterY + "px" });
	}

	/**
	 * Get index for next column
	 * @param {number} index
	 * @returns {number}
	 */
	getNextColumn(index) {
		return index % this._columnsHeights.length;
	}

	/**
	 * Get index of shortest column
	 * @returns {number}
	 */
	getShortest() {
		let shortest = 0;

		for (let idx = 0; idx < this._columnsCount; idx++)
			if (this._columnsHeights[idx] < this._columnsHeights[shortest]) shortest = idx;

		return shortest;
	}

	/**
	 * Get index of biggest column
	 * @returns {number}
	 */
	getLongest() {
		let longest = 0;

		for (let idx = 0; idx < this._columnsCount; idx++)
			if (this._columnsHeights[idx] > this._columnsHeights[longest]) longest = idx;

		return longest;
	}

	/**
	 * Handler for auto layout rebuild for "onresize" events
	 */
	resizeThrottler() {
		// ignore resize events as long as an actualResizeHandler execution is in the queue
		if (!this._resizeTimeout) {
			this._resizeTimeout = setTimeout(() => {
				this._resizeTimeout = null;
				// IOS Safari throw random resize event on scroll, call layout only if size has changed
				if (this._container.clientWidth !== this._width) this.buildLayout();

				// The actualResizeHandler will execute at a rate of 30fps
			}, 33);
		}
	}

	destroy() {
		if (typeof this._removeListener === "function") this._removeListener();

		Array.from(this._container.children).forEach((child) => {
			child.style.removeProperty("width");
			child.style.removeProperty("transform");
		});

		this._container.style.removeProperty("height");
		this._container.style.removeProperty("min-width");
	}
}

export default Masonry;
