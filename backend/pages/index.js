const { SetCompleteMIMEType } = require("../utils/urls-and-cookies");

/**
 * @param {import("../utils/urls-and-cookies").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { res, data, location } = iModuleDataObject;

	res.statusCode = 200;
	res.setHeader("Content-Type", SetCompleteMIMEType(location));
	res.end(data);
};
