# MIREA Schedule System
#### Project is still under `development`

![MSS](https://mirea.xyz/img/logo_wide_transparent.png)

## Complete system for MIREA schedule

This repo represents all the code, structure and pipelines for MSS project, including
* [Front](./frontend) and [back](./backend)-ends for [mirea.xyz](https://mirea.xyz) site
* [Telegram bot](./telegram) available by [@mirea_table_bot](https://t.me/mirea_table_bot)
* [Android app](./app) available on [mirea.xyz/app](https://mirea.xyz/app) or in [project's releases](https://github.com/serguun42/mss/releases)
* [Scrapper](./scrapper) – script for parsing tables for each study group
* [Nofitier](./nofitier) – collecting and sending logs and errors


## Folders

Each folder contains its own README with. Here's the list of them with responsible dev and main info for each:

| Folder						| Dev											| What is used and how it works
| ----------------------------- | :-------------------------------------------: | -----------------------------
| [Backend](./backend)			| [@serguun42](https://github.com/serguun42)	| Handles back for front, back for API, back for user accounts. All the stuff.
| [Frontend](./frontend)		| [@serguun42](https://github.com/serguun42)	| Front done with Vue.js
| [Android app](./app)			| [@rodyapal](https://github.com/rodyapal)		| *no desc yet, stay tuned*
| [Telegram bot](./telegram)	| [@serguun42](https://github.com/serguun42)	| Sends schedule on demand, stores users, does mailing on morning, evening and late evening. Notifies via [notifier](./notifier), uses local Telegram API server (if specified), uses local MongoDB [mirea-table-bot](https://github.com/serguun42/mirea-table-bot) was the base for it.
| [Scrapper](./scrapper)		| [@serguun42](https://github.com/serguun42)	| Parses schedule page, gets links to `.xlsx`-files, parses them then, builds table models for each and every possible study group, updates DB schedule for each group of those ones.
| [Nofitier](./nofitier)		| [@serguun42](https://github.com/serguun42)	| Runs local HTTP server, notifies into *System Telegram*, logs into *stdout*, *stderr*. Use tags (inner and passed), determines which output(s) will be used to log/notify.
| [CI/CD](./cicd)				| [@serguun42](https://github.com/serguun42)	| Single JS-script used only for notifying on CI/CD events. Also there are 2 Github Action workflow/pipeline scripts:<br><ul><li>[build.yml](.github/workflows/build.yml) contains main workflow for deploying production.</li><li>[notify.yml](.github/workflows/notify.yml) has only one job – to notify on event `push` into every branch except `master`.</li></ul>

## Dev Codex
* Не коммитить в ветку `master`. Только pull-реквесты.
* Перед коммитом и пушем проверяем ветку.
* **Не заливаем** конфиги, храним их *локально*. Заливаем только **образцы** конфигов, а в коде делаем проверку на конфиг (сравниваем с локальным глобальным), и/или подменяем во время CI/CD, и/или как угодно. Но не Secrets – плохо быть завязанным на архитектуру какого-либо сервиса.
* В каждой ветке сохраняем папочную структуру и **работаем только в той папке, которая предназначена для этой ветки**.
