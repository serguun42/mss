export type BackendConfig = {
  DATABASE_NAME: string;
  DATABASE_CONNECTION_URI: string;

  LOGGING_TAG: string;
  LOGGING_HOST: string;
  LOGGING_PORT: number;

  MAX_NUMBER_OF_BACKEND_REQUESTS_IN_MINUTE: number;
  MAX_NUMBER_OF_BACKEND_REQUESTS_IN_HOUR: number;
  BACKEND_REQUESTS_WHITELIST: string[];
};

export type APIModuleDTO = {
  req: import("http").IncomingMessage;
  res: import("http").ServerResponse;
  path: string[];
  queries: {
    [queryName: string]: string | true;
  };
  sendCode: (code: number) => void;
  sendPayload: (code: number, data: any) => void;
  mongoDispatcher?: import("../database/dispatcher").default;
};
