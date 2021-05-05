export type ModuleCallingObjectType = {
    req: import("http").IncomingMessage;
    res: import("http").ServerResponse;
    fileStream: import("fs").ReadStream;
    pageChecker: boolean;
    pathname: string;
    path: string[];
    location: string;
    queries: {
        [queryName: string]: string | true;
    };
    cookies: {
        [name: string]: string;
    };
	acceptGzip: boolean,
    GlobalError404: () => void;
    GlobalSend: (iCode: number) => void;
    GlobalSendCustom: (iCode: number, iData: any) => void;
}
