# MIREA Schedule System

## BACKEND

Uses Node.js as backend for API, nginx for static.
Proxies logs from [app](https://github.com/serguun42/mss/tree/master/app) to [notifier](https://github.com/serguun42/mss/tree/master/notifier).

### `nginx`
Uses nginx as server for static and as reverse-proxy for API. See [nginxconfig.io](https://nginxconfig.io/) and [nginx.base.conf](./nginx.base.conf)

## Commands

1. Install all dependencies `npm i --only=prod`
2. Run backend for first time `npm run backend-start`

## Some folders

* `utils` – Common util scripts like DB handler, logger or parsers
* `pages` – Backend side for some pages, e.g. `/` -> `index.js`, `/api` -> `api.js`

## Some other files
`backend.config.json` – Config file with ports, DB, logging, rate limiter 
