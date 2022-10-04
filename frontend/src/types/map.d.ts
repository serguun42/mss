export type FloorColorScheme = "light" | "dark";

export type Room = string;

export type FloorOfColor = {
	/** Fetched raw text SVG layout */
	svgPlain: string;
	/** All names of rooms parsed from SVG's rects' ids */
	rooms: Room[];
};

export type Floor = { [colorScheme in FloorColorScheme]: FloorOfColor };
