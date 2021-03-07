# MIREA Schedule System

## NOTIFIER

Runs local HTTP server, notifies into *System Telegram*, logs into *stdout*, *stderr*.
Use tags (inner and passed), determines which output(s) will be used to log/notify.
<br>

HTTP server runs on port, defined in `notifier-and-logger.config.json`;

## Commands

1. Install all dependencies `npm install`
2. Run notifier for first time `npm run notifier`


## Some other files
`notifier-and-logger.config.json` – File for tokens, port, etc.
