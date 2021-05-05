const { SetCompleteMIMEType } = require("../utils/urls-and-cookies");

/**
 * @param {import("../typings").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { res, fileStream, location, GlobalSendCustom } = iModuleDataObject;

	res.setHeader("Content-Type", SetCompleteMIMEType(location));	
	GlobalSendCustom(200, fileStream);
};
