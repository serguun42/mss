/**
 * @param {import("../types").Option} option
 * @returns {boolean}
 */
const CheckIfDistant = (option) => /^д$|дистан/i.test(option?.place || option?.type || "");

export default CheckIfDistant;
