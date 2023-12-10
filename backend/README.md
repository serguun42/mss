# MIREA Schedule System

## BACKEND

Node.js for serving API of MSS.

## Commands

1. Install all dependencies `npm ci --omit=dev`
2. Run backend in production mode `npm run production`

## Configs

`backend.config.json` – Config file with ports, DB, logging, rate limiter

## Tests

Check with Jest – `npm run test`, see tests themselves in [`tests` folder](./tests/).

## Monitoring

This backend serves for Prometheus monitoring at `/metrics`. Check global [Docker Compose file](../docker-compose.yml) and [`prometheus.yml`](../monitoring/prometheus.yml).
