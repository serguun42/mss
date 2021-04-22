export type ModuleCallingObjectType = {
    req: import("http").IncomingMessage;
    res: import("http").ServerResponse;
    data: Buffer | string;
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
    GlobalError404: () => void;
    GlobalSend: (iCode: number) => void;
    GlobalSendCustom: (iCode: number, iData: any) => void;
}
