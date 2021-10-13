const
	fs = require("fs"),
	util = require("util"),
	fsReadDir = util.promisify(fs.readdir);


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
	TGE
};
