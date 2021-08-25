# MIREA Schedule System

![MSS](https://mirea.xyz/img/logo_wide_transparent.png?2021-04-20)

## Complete system for MIREA schedule

This repo represents all the code, structure and pipelines for MSS project, including
* [Front](./frontend) and [back](./backend)-ends for [mirea.xyz](https://mirea.xyz) site
* [Telegram bot](./telegram) available by [@mirea_table_bot](https://t.me/mirea_table_bot)
* [Android app](./app) available on [mirea.xyz/app](https://mirea.xyz/app) or in [project's releases](https://github.com/serguun42/mss/releases)
* [Scrapper](./scrapper) – script for parsing tables for each study group
* [Notifier](./notifier) – collecting and sending logs and errors

### Project is still under `development`. Check out [open issues](../../issues), [closed ones](../../issues?q=is%3Aissue+is%3Aclosed) and [latest commits](../../commits).

## Project's API

MSS has public API with common methods and actions. You can view and test it with [Redoc](https://mirea.xyz/docs/api/redoc.html) or with [Swagger UI](https://mirea.xyz/docs/api/swagger).

## Folders

Each folder contains its own README with. Here's the list of them with responsible dev and main info for each:

| Folder						| Dev											| What is used and how it works
| ----------------------------- | :-------------------------------------------: | -----------------------------
| [Backend](./backend)			| [@serguun42](https://github.com/serguun42)	| Handles back for front, back for API, back for user accounts. All the stuff.
| [Frontend](./frontend)		| [@serguun42](https://github.com/serguun42)	| Front done with Vue.js. View and save groups' schedule.
| [Android app](./app)			| [@rodyapal](https://github.com/rodyapal)		| Android app with light/dark/auto theme. View and save groups' schedule
| [Telegram bot](./telegram)	| [@serguun42](https://github.com/serguun42)	| Sends schedule on demand, stores users, does mailing on morning, evening and late evening. Notifies via [notifier](./notifier), uses local Telegram API server (if specified), uses local MongoDB [mirea-table-bot](https://github.com/serguun42/mirea-table-bot) was the base for it.
| [Scrapper](./scrapper)		| [@serguun42](https://github.com/serguun42)	| Parses schedule page, gets links to `.xlsx`-files, parses them then, builds table models for each and every possible study group, updates DB schedule for each group of those ones.
| [Notifier](./notifier)		| [@serguun42](https://github.com/serguun42)	| Runs local HTTP server, notifies into *System Telegram*, logs into *stdout*, *stderr*. Use tags (inner and passed), determines which output(s) will be used to log/notify.
| [CI/CD](./cicd)				| [@serguun42](https://github.com/serguun42)	| Single JS-script used only for notifying on CI/CD events. Also there are 2 Github Action workflow/pipeline scripts:<br><ul><li>[build.yml](.github/workflows/build.yml) contains main workflow for deploying production.</li><li>[notify.yml](.github/workflows/notify.yml) has only one job – to notify on event `push` into every branch except `master`.</li></ul>

### Этот проект, всё его содержимое и разработчики не связаны с администрацией РТУ МИРЭА.
### [License](./LICENSE)
