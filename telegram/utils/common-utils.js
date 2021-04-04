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

/**
 * @param {String} lastCatPhoto
 * @returns {Promise<String>}
 */
const GetCatImage = (lastCatPhoto) => fsReadDir(CATS.FOLDER).then((catImages) => {
	const LocalGetRandom = () => {
		const randomPicked = catImages[Math.floor(Math.random() * catImages.length)];

		if (randomPicked === lastCatPhoto)
			return LocalGetRandom();
		else
			return randomPicked;
	};

	return Promise.resolve(LocalGetRandom());
});

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
	GetCatImage,
	TGE
};
