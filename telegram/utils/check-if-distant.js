/**
 * @param {import("./build-layout").Option} option
 * @returns {boolean}
 */
const CheckIfDistant = (option) => /^д$|дистан/i.test(option?.place || option?.type || "");

module.exports = CheckIfDistant;
