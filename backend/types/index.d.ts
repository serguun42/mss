type ModuleCallingObjectTypeBase = {
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
};

export type UtilsType = {
    /** Example `UTIL.SafeDecode(UTIL.SafeURL(req.url).pathname)` */
    SafeDecode: (iString: string) => string;

    /** Example `UTIL.SafeEscape(pathname)` */
    SafeEscape: (iString: string) => string;

    /** Example `UTIL.SafeURL(req.url)` */
    SafeURL: (iPathname: string) => URL;
    
    /** Example `UTIL.ParseCookie(req.headers)` */
    ParseCookie: (iHeaders: {[headerName: string]: string}) => {[name: string]: string};

    /** Example `UTIL.ParsePath(pathname)` */
    ParsePath: (iPath: string) => string[];

    /** Example `UTIL.ParseQuery(UTIL.SafeURL(req.url).search)` */
    ParseQuery: (iQuery: string) => {[queryName: string]: string | true};

    /** Example `UTIL.CombineQueries({ pass: true, search: "Seeking group" })` */
    CombineQueries: (iQueries: {[queryName: string]: string | true}) => string;

    SetMIMEType: (iExtention: string) => string;

    SetCompleteMIMEType: (iExtention: string) => string;
}

export type ModuleCallingObjectType = ModuleCallingObjectTypeBase & UtilsType;
export default ModuleCallingObjectType;
