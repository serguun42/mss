export default Dispatcher;
declare namespace Dispatcher {
    const listeners: {
        [eventName: string]: Function[];
    };
    function link(eventName: string, eventHandler: Function): void;
    function unlink(eventName: string, eventHandler: Function): void;
    function call(eventName: string, ...argsForHandler: any[]): void;
}
