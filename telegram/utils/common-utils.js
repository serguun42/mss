const
	fs = require("fs"),
	util = require("util"),
	fsReadDir = util.promisify(fs.readdir);


const
	DEV = require("os").platform() === "win32" || process.argv[2] === "DEV",
	CONFIG = DEV ? require("../../../DEV_CONFIGS/telegram-bot.config.json") : require("../telegram-bot.config.json"),
	{
		CATS
	} = CONFIG;


/**
 * @param {String} iString
 * @returns {String}
 */
const Capitalize = iString => {
	if (!iString || typeof iString != "string") return iString;

	return iString[0].toUpperCase() + iString.slice(1).toLowerCase();
};

/**
 * @param {Array} iArray
 * @param {Number} iChunkSize
 * @returns {Array.<Array>}
 */
const Chunkify = (iArray, iChunkSize) => {
	if (!iArray || !iChunkSize) return iArray;

	const outArray = [];

	iArray.forEach((elem, index) => {
		let pasteIndex = Math.floor(index / iChunkSize);
		if (!outArray[pasteIndex]) outArray.push([]);
		outArray[pasteIndex].push(elem);
	});

	return outArray;
};

let catImages = [];
/**
 * @returns {Promise<String[]>}
 */
const GetAllCatsImages = () => {
	if (catImages.length) return Promise.resolve(catImages);

	return fsReadDir(CATS.FOLDER)
		.then((allPhotos) => {
			catImages = allPhotos;
			return Promise.resolve(catImages);
		});
};			

/**
 * @param {String} lastCatPhoto
 * @returns {Promise<String>}
 */
const GetCatImage = (lastCatPhoto) => {
	/**
	 * @param {String[]} allPhotos
	 */
	const LocalGetRandom = (allPhotos) => {
		const randomPicked = allPhotos[Math.floor(Math.random() * allPhotos.length)];

		if (randomPicked === lastCatPhoto)
			return LocalGetRandom(allPhotos);
		else
			return randomPicked;
	};

	return GetAllCatsImages()
		.then((allPhotos) => {
			const picked = LocalGetRandom(allPhotos);

			return Promise.resolve(picked);
		});
};

/**
 * Telegram Escape
 * @param {String} iStringToEscape
 * @returns {String}
 */
const TGE = iStringToEscape => {
	if (!iStringToEscape) return "";
	
	if (typeof iStringToEscape === "string")
		return iStringToEscape
			.replace(/\&/g, "&amp;")
			.replace(/\</g, "&lt;")
			.replace(/\>/g, "&gt;");
	else
		return TGE(iStringToEscape.toString());
};


module.exports = exports =  {
	Capitalize,
	Chunkify,
	GetAllCatsImages,
	GetCatImage,
	TGE
};
