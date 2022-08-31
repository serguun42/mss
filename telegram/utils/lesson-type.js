/**
 * @param {string} type
 * @returns {string}
 */
const LessonNameByType = (type) => {
	if (typeof type !== "string") return "";

	switch (type.trim().toLowerCase()) {
		case "П":
		case "п":
		case "пр": return "Семинар"; break;
		case "Л":
		case "л":
		case "лк": return "Лекция"; break;
		case "ЛБ":
		case "лб":
		case "лаб": return "Лабораторная"; break;
		case "СР":
		case "ср":
		case "с/р": return "Сам. раб."; break;
		case "КП":
		case "кп":
		case "КР":
		case "кр": return "Курсач"; break;
		default: return type; break;
	}
};

module.exports = LessonNameByType;
