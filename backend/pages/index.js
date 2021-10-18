/**
 * @param {import("../types").ModuleCallingObjectType} iModuleDataObject
 */
module.exports = (iModuleDataObject) => {
	const { res, fileStream, location, GlobalSendCustom, SetCompleteMIMEType } = iModuleDataObject;

	res.setHeader("Content-Type", SetCompleteMIMEType(location));	
	GlobalSendCustom(200, fileStream);
};
