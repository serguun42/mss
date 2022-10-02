export interface MasonryConfig {
	/**
	 * Minimal width of elements.
	 * @default 255
	 */
	baseWidth: number;

	/**
	 * Container's selector or element. **Required**
	 * @default Null
	 */
	container: string | HTMLElement;

	/**
	 * Width / height of gutter between elements. Use gutterX / gutterY to set different values.
	 * @default 10
	 */
	gutter: number;

	/**
	 * Width of gutter between elements. Need gutterY to work, fallback to `gutter`.
	 * @default null
	 */
	gutterX: number;

	/**
	 * Height of gutter between elements. Need gutterX to work, fallback to `gutter`.
	 * @default null
	 */
	gutterY: number;

	/**
	 * Whether or not MiniMasonry places elements on the shortest column or keeps exact order of the list.
	 * @default true
	 */
	minify: boolean;

	/**
	 * Set left gutter on first columns and right gutter on last.
	 * @default true
	 */
	surroundingGutter: boolean;

	/**
	 * Gutter applied when only 1 column can be displayed.
	 * @default 5
	 */
	ultimateGutter: number;

	/**
	 * Sorting direction, "ltr" or "rtl".
	 * @default "ltr"
	 */
	direction: string;

	/**
	 * False will start to sort from center, true will start from left or right according to direction parameter.
	 * @default false
	 */
	wedge: boolean;
}

/**
 * MiniMasonry.js modified by serguun42
 *
 * @see https://github.com/Spope/MiniMasonry.js/blob/master/src/minimasonry.js
 * @author Spope
 * @license MIT
 */
export declare class Masonry {
	static DEFAULT_CONFIG: MasonryConfig;

	constructor(conf: MasonryConfig);

	reset(): void;

	/**
	 * Set styles thourgh vanilla JS or with Vue
	 */
	setStyle(elem: HTMLElement, styles: Partial<CSSStyleDeclaration>): void;

	/**
	 * Get count of columns
	 */
	getColumnsCount(): number;

	/**
	 * Get count of columns
	 */
	computeWidth(): number;

	buildLayout(): void;

	/**
	 * Get index for next column
	 */
	getNextColumn(index: number): number;

	/**
	 * Get index of shortest column
	 */
	getShortest(): number;

	/**
	 * Get index of biggest column
	 */
	getLongest(): number;

	/**
	 * Handler for auto layout rebuild for "onresize" events
	 */
	resizeThrottler(): void;

	destroy(): void;
}

export default Masonry;
