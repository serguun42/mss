/**
 * @param {String} iString
 * @returns {String}
 */
export function Capitalize(iString: string): string;
/**
 * @param {Array} iArray
 * @param {Number} iChunkSize
 * @returns {Array.<Array>}
 */
export function Chunkify(iArray: any[], iChunkSize: number): Array<any[]>;
/**
 * @param {String} lastCatPhoto
 * @returns {Promise<String>}
 */
export function GetCatImage(lastCatPhoto: string): Promise<string>;
/**
 * Telegram Escape
 * @param {String} iStringToEscape
 * @returns {String}
 */
export function TGE(iStringToEscape: string): string;
