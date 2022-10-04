const ASSET_PATH = "/maps.json";

let everLoaded = false;
/** @type {import("../types/map").Floor[]} */
const FLOORS = Array.from({ length: 5 }, (_, idx) => ({
	light: {
		svgPlain: null,
		rooms: []
	},
	dark: {
		svgPlain: null,
		rooms: []
	}
}));

const ID_TO_NAME_DICT = {
	"a": "А",
	"b": "Б",
	"v": "В",
	"g": "Г",
	"d": "Д",
	"i": "И",
	"ivc": "ивц",
};

/**
 * @param {string} roomId
 * @returns {string | null}
 */
const RoomIdToName = (roomId) => {
	const splited = roomId.split("-");
	if (splited.length !== 2 && splited.length !== 3) return null;

	const [roomLetter, roomNumber, roomNumberSuffix] = splited;
	const fineRoomLetter = ID_TO_NAME_DICT[roomLetter.toLowerCase()];
	if (!fineRoomLetter) return null;
	if (splited.length === 3 && !parseInt(roomNumberSuffix)) return null;

	const roomName = `${fineRoomLetter}-${
		roomNumber
		.replace(/_(\d+)$/, (wholeMatch, numberSuffix) =>
			parseInt(numberSuffix) && `-${parseInt(numberSuffix) - 1}` || wholeMatch
		)
	}${roomNumberSuffix ? "-" + roomNumberSuffix : ""}`.trim();
	return roomName;
};

const NAME_TO_ID_DICT = {
	"а": "a",
	"б": "b",
	"в": "v",
	"г": "g",
	"д": "d",
	"и": "i",
	"ивц": "ivc",
};

/**
 * @param {string} roomName
 * @returns {string | null}
 */
export const RoomNameToId = (roomName) => {
	const splited = roomName.split("-");
	if (splited.length !== 2 && splited.length !== 3) return null;

	const [roomLetter, roomNumber, roomNumberSuffix] = splited;
	const fineRoomLetter = NAME_TO_ID_DICT[roomLetter.toLowerCase()];
	if (!fineRoomLetter) return null;
	if (splited.length === 3 && !parseInt(roomNumberSuffix)) return null;

	const roomId = `${fineRoomLetter}-${roomNumber}${roomNumberSuffix ? "-" + roomNumberSuffix : ""}`.trim();
	return roomId;
};

/**
 * @param {string} svgPlain
 * @returns {import("../types/map").Room[]}
 */
export const BuildRooms = (svgPlain) => Array.from(
		svgPlain.matchAll(
			/(?:id=")(?<plainElemId>[^"]+)"/g
			// /(?:id=")(?<plainElemId>[^"]+)"(\sx="(?<x>\d+)")?(\sy="(?<y>\d+)")?/g
		)
	)
	.map((matched) => matched?.groups && RoomIdToName(matched.groups.plainElemId))
	.filter(Boolean);
	

/**
 * @return {Promise<import("../types/map").Floor[]>}
 */
export const LoadAssets = () => everLoaded
	? Promise.resolve(FLOORS)
	: fetch(ASSET_PATH)
		.then((res) => {
			if (!res.ok) return Promise.reject(res.status);

			return res.json();
		})
		.then(
			/** @param {{ floorName: string, svgPlain: string }[] allFloors} */
			(allFloors) => {
				allFloors.map((floorPlain) => {
					const floorIndex = parseInt(floorPlain.floorName.match(/^(\d+)/)?.[0]) || 0;
					/** @type {import("../types/map").FloorColorScheme} */
					const floorColorScheme = /_dark/i.test(floorPlain.floorName) ? "dark" : "light";

					const buildingFloorOfColor = FLOORS[floorIndex]?.[floorColorScheme];
					if (!buildingFloorOfColor) return;

					buildingFloorOfColor.svgPlain = floorPlain.svgPlain;
					buildingFloorOfColor.rooms = BuildRooms(floorPlain.svgPlain);
				});

				everLoaded = true;
				return Promise.resolve(FLOORS);
			}
		)
		.catch((e) => {
			console.warn(e);
			return Promise.resolve(FLOORS);
		});
