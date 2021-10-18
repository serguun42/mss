export = Logging;
/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
declare function Logging(...args: (Error | string)[]): void;
declare namespace Logging {
    export { WrapperForLoggingWithCustomTag as WithCustomTag };
}
/**
 * @param {(Error | String)[]} args
 * @returns {void}
 */
declare function WrapperForLoggingWithCustomTag(...args: (Error | string)[]): void;
