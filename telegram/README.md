# MIREA Schedule System

## TELEGRAM

Project's Telegram bot. [mirea-table-bot](https://github.com/serguun42/mirea-table-bot) was the base for it.
<br>
Notifies via [notifier](https://github.com/serguun42/mss/tree/master/notifier), uses local Telegram API server (if specified), uses local MongoDB


## Commands

1. Install all dependencies `npm i --only=prod`
2. Start Telegram bot `npm run telegram`


## Folders

Folder contains essential files for

#### [Admin](./admin)
* Logging out from TG cloud server
* Closing local TG API server instance
* Mailing to all users

#### [Utils](./utils)
* DB handler
* Logger handler


## Some other files
`telegram.config.json` – File for tokens, admin, DB name, etc. `TELEGRAM_API_SERVER_PORT` can be omitted, bot connects to cloud server then.
