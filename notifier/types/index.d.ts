export type NotifierConfig = {
  DATABASE_NAME: string;
  DATABASE_CONNECTION_URI: string;

  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_API_SERVER_HOST: string;
  TELEGRAM_API_SERVER_PORT: number;
  TELEGRAM_SYSTEM_CHANNEL: number;
};

export type LoggingPayload = {
  isError: boolean;
  args: string[];
  tag: string;
};

export type LoggingInterface = (payload: LoggingPayload) => void;
