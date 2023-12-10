# MIREA Schedule System

![MSS](https://mirea.xyz/img/logo_wide_transparent.png)

## Complete system for MIREA schedule

This repo represents all the code, structure and pipelines for MSS project, including

- [Frontend](./frontend) for [mirea.xyz](https://mirea.xyz) site
- [Backend](./backend) with API for that
- [Telegram bot](./telegram) available by [@mirea_table_bot](https://t.me/mirea_table_bot)
- [Scrapper](./scrapper) – script for parsing tables for each study group
- [Notifier](./notifier) – collecting and sending logs and errors
- [Android app](./app) – outdated, [see this page](https://mirea.xyz/apps)

## Project's API

MSS has public API with common methods and actions. You can view and test it with [Redoc](https://mirea.xyz/docs/api/redoc.html) or with [Swagger UI](https://mirea.xyz/docs/api/swagger).

## Folders

Each folder contains its own README with. Here's the list of them with responsible dev and main info for each:

| Folder                       |                    Dev                     | What is used and how it works                                                                                                                                                                                                                                                                                                   |
| ---------------------------- | :----------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Backend](./backend)         | [@serguun42](https://github.com/serguun42) | Handles back for front, back for API, back for user accounts. All the stuff.                                                                                                                                                                                                                                                    |
| [Frontend](./frontend)       | [@serguun42](https://github.com/serguun42) | Front done with Vue.js. View and save groups' schedule.                                                                                                                                                                                                                                                                         |
| [Telegram bot](./telegram)   | [@serguun42](https://github.com/serguun42) | Sends schedule on demand, stores users, does mailing on morning, evening and late evening. Notifies via [notifier](./notifier), uses local Telegram API server (if specified), uses local MongoDB [mirea-table-bot](https://github.com/serguun42/mirea-table-bot) was the base for it.                                          |
| [Scrapper](./scrapper)       | [@serguun42](https://github.com/serguun42) | Parses schedule page, gets links to `.xlsx`-files, parses them then, builds table models for each and every possible study group, updates DB schedule for each group of those ones.                                                                                                                                             |
| [Notifier](./notifier)       | [@serguun42](https://github.com/serguun42) | Runs local HTTP server, notifies into _System Telegram_, logs into _stdout_, _stderr_. Use tags (inner and passed), determines which output(s) will be used to log/notify.                                                                                                                                                      |
| [Panel](./panel)             | [@serguun42](https://github.com/serguun42) | Configuration panel for admins to fine-tune some of the system parameters, such as semester start date and scraping interval. Requires authentication via in-house Keycloak.                                                                                                                                                    |
| [Monitoring](./monitoring)   | [@serguun42](https://github.com/serguun42) | Monitoring done with Prometheus and Grafana. Comes with pre-built panel for monitoring Backend (see [`backend/backend-server.js`](./backend/backend-server.js#L14) and [`monitoring/grafana/node-dashboard.json`](./monitoring/grafana/node-dashboard.json)). Uses Panel as gateway/reverse-proxy with Keycloak authentication. |
| [Healthchech](./healthcheck) | [@serguun42](https://github.com/serguun42) | Standalone healthcheck service that deploys to Yandex.Cloud Serverless containers and gives current status of the MSS.                                                                                                                                                                                                          |
| [Keycloak](./keycloak)       | [@serguun42](https://github.com/serguun42) | In-house instance of Keycloak to authenticate admin users for such parts of MSS as Panel. See [`docker-compose.yml`](./docker-compose.yml) for details.                                                                                                                                                                         |
| [Android app](./app)         |  [@rodyapal](https://github.com/rodyapal)  | Android app written in Kotlin. Serves the same task as Frontend. _Outdated, [see this page](https://mirea.xyz/apps)_.                                                                                                                                                                                                           |

## CI/CD

Build & deploy are now being done with Docker. See workflow files and [docker-compose.yml](./docker-compose.yml). In total there are 3 Github Action workflow scripts:

- [build.yml](.github/workflows/build.yml) contains main workflow for deploying production.
- [notify-on-merge.yml](.github/workflows/notify-on-merge.yml) serves to notify on event `pull_request` into every branch.
- [notify-on-push.yml](.github/workflows/notify-on-push.yml) serves to notify on event `push` into every branch except `master`.

---

### Этот проект, всё его содержимое и разработчики не связаны с администрацией РТУ МИРЭА.

### [License](./LICENSE)
