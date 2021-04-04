# MIREA Schedule System

## TELEGRAM

Parses schedule page, gets links to `.xlsx`-files, parses them then, builds table models for each and every possible study group, updates DB schedule for each group of those ones.
<br>

If necessary, notifies via [notifier](https://github.com/serguun42/mss/tree/master/notifier).


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
`telegram.config.json` – File for tokens, admin, DB name, etc. `TELEGRAM_API_SERVER_PORT` can be omitted, bot connects to cloud server then
