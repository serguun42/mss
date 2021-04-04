export type Option = {
    weeks?: number[];
    name: string;
    type: string;
    tutor?: string;
    place?: string;
    link?: string;
};
export type Lesson = Option[];
export type DayOfWeek = {
    day: string;
    odd: Lesson[];
    even: Lesson[];
};
export type Schedule = DayOfWeek[];
export type GlobalScheduleGroup = {
    remoteFile: string;
    unitName: string;
    unitCourse: string;
    groupName: string;
    groupSuffix: string;
    lessonsTimes: string[][];
    schedule: Schedule;
};
export type GlobalSchedule = {
    [groupName: string]: GlobalScheduleGroup;
};
export type GettingDayLayout = (iGroupName: string) => Promise<{
    nameOfDay: string;
    layout: string;
} | null>;
/**
 * @typedef {Object} Option
 * @property {number[]} [weeks]
 * @property {string} name
 * @property {string} type
 * @property {string} [tutor]
 * @property {string} [place]
 * @property {string} [link]
 *
 *
 * @typedef {Option[]} Lesson
 *
 *
 * @typedef {Object} DayOfWeek
 * @property {string} day
 * @property {Lesson[]} odd
 * @property {Lesson[]} even
 *
 *
 * @typedef {DayOfWeek[]} Schedule
 */
/**
 * @typedef {Object} GlobalScheduleGroup
 * @property {String} remoteFile
 * @property {String} unitName
 * @property {String} unitCourse
 * @property {String} groupName
 * @property {String} groupSuffix
 * @property {String[][]} lessonsTimes
 * @property {Schedule} schedule
 */
/** @typedef {{[groupName: string]: GlobalScheduleGroup}} GlobalSchedule */
/**
 * @param {String} iGroup
 * @returns {Promise<GlobalScheduleGroup | null>}
 */
export function GetScheduleByGroup(iGroup: string): Promise<GlobalScheduleGroup | null>;
/**
 * @returns {Number}
 */
export function GetWeek(): number;
/**
 * @returns {Number}
 */
export function GetDay(): number;
/**
 * @param {GlobalScheduleGroup} iGroup
 * @param {Number} iDay
 * @param {Option} iOption
 * @param {Number} iLessonPosition
 * @param {Boolean} [iSkipTime = false]
 * @returns {String}
 */
export function BuildOptionLayout(iGroup: GlobalScheduleGroup, iDay: number, iOption: Option, iLessonPosition: number, iSkipTime?: boolean): string;
/**
 * @param {GlobalScheduleGroup} iGroup
 * @param {Number} iDay
 * @param {Option[]} iOptions
 * @param {Number} iLessonPosition
 * @param {Number} iWeek
 * @returns {String}
 */
export function BuildOption(iGroup: GlobalScheduleGroup, iDay: number, iOptions: Option[], iLessonPosition: number, iWeek: number): string;
/**
 * @param {GlobalScheduleGroup | String} iGroup
 * @param {Number} iNumberOfDayInWeek
 * @param {Number} iWeek
 * @returns {Promise<String>}
 */
export function BuildDay(iGroup: GlobalScheduleGroup | string, iNumberOfDayInWeek: number, iWeek: number): Promise<string>;
/**
 * @param {GlobalScheduleGroup | String} iGroup
 * @param {Number} iWeek
 * @returns {Promise<String>}
 */
export function BuildWeek(iGroup: GlobalScheduleGroup | string, iWeek: number): Promise<string>;
/**
 * @async
 * @callback GettingDayLayout
 * @param {String} iGroupName
 * @returns {Promise<{nameOfDay: string, layout: string} | null>}
 */
/**
 * @type {GettingDayLayout}
 */
export const GetToday: GettingDayLayout;
/**
 * @type {GettingDayLayout}
 */
export const GetTomorrow: GettingDayLayout;
