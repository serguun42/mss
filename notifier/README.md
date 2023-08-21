# MIREA Schedule System

## NOTIFIER

Runs local HTTP server, notifies into *System Telegram*, logs into *stdout*, *stderr*.
Use tags (inner and passed), determines which output(s) will be used to log/notify.
<br>

HTTP server runs on port, defined in `notifier-and-logger.config.json`;

## Commands

1. Install all dependencies `npm install`
2. Run notifier with PM2 `npm run production`


## Some other files
`notifier-and-logger.config.json` – File for tokens, port, etc. `TELEGRAM_API_SERVER_PORT` can be omitted
