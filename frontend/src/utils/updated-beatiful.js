/**
 * Builds fine date for 'Updated' badges
 *
 * @param {string | Date} dateLike
 * @returns {string | null}
 */
const UpdatedBeautiful = (dateLike) => {
	if (!dateLike) return null;

	const parsedUpdatedDate = new Date(dateLike);
	if (isNaN(parsedUpdatedDate.getTime())) return null;

	if (Math.floor((parsedUpdatedDate.getTime() - new Date().getTimezoneOffset() * 60e3) / 86400e3) === Math.floor((Date.now() - new Date().getTimezoneOffset() * 60e3) / 86400e3))
		return `сегодня, ${parsedUpdatedDate.getHours()}:${parsedUpdatedDate.getMinutes().toString().padStart(2, "0")}`;

	if (Math.floor((parsedUpdatedDate.getTime() - new Date().getTimezoneOffset() * 60e3) / 86400e3) === Math.floor((Date.now() - new Date().getTimezoneOffset() * 60e3) / 86400e3) - 1)
		return `вчера, ${parsedUpdatedDate.getHours()}:${parsedUpdatedDate.getMinutes().toString().padStart(2, "0")}`;

	return `${parsedUpdatedDate.toLocaleDateString()}, ${parsedUpdatedDate.getHours()}:${parsedUpdatedDate.getMinutes().toString().padStart(2, "0")}`;
};

export default UpdatedBeautiful;
