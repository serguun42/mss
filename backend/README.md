# MIREA Schedule System

## BACKEND

Handles back for front, back for API, back for user accounts. All the stuff.
<br>
Proxies logs from [app](https://github.com/serguun42/mss/tree/master/app) to [notifier](https://github.com/serguun42/mss/tree/master/notifier).


## Commands

1. Install all dependencies `npm i --only=prod`
2. Run backend for first time `npm run backend-start`

## Some folders

* `utils` – Common util scripts like DB handler, logger or parsers
* `pages` – Backend side for some pages, e.g. `/` -> `index.js`, `/api` -> `api.js`

## Some other files
`backend.config.json` – File for certs, hooks, DB, etc.
