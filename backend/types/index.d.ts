export type ModuleCallingObjectType = {
    req: import("http").IncomingMessage;
    res: import("http").ServerResponse;
    pathname: string;
    path: string[];
    queries: {
        [queryName: string]: string | true;
    };
    cookies: {
        [name: string]: string;
    };
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

export default ModuleCallingObjectType;
