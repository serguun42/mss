# MIREA Schedule System

## Notifier

Runs local HTTP server, that collects logs from all MSS services. Saves all logs into MongoDB, logs into _stdout_ and _stderr_, and sends errored ones to special Telegram channel.

HTTP server runs on port, defined in `notifier.config.json`;

## Commands

1. Install all dependencies `npm install`
2. Run notifier with PM2 `npm run production`

## Some other files

`notifier.config.json` – File for tokens, port, etc. `TELEGRAM_API_SERVER_PORT` can be omitted
