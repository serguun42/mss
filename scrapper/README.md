# MIREA Schedule System

## SCRAPPER

Parses schedule page, gets links to `.xlsx`-files, parses them then, builds table models for each and every possible study group, updates DB schedule for each group of those ones.
<br>

If necessary, notifies via [notifier](https://github.com/serguun42/mss/tree/master/notifier).


## Commands

1. Install all dependencies `npm install`
2. Run scrapper for first time `npm run scrap`


## Cron job

Cron job for running scrapper on it's own schedule: *at minute 0 past every 3rd hour*. Very simple, very reliable.

`0 */3 * * * cd $MSS/scrapper && node scrapper.js`


## Some other files
`scapper.fixes.json` – File for correcting typos in original `.xlsx`-files.
<br>

`scapper.config.json` – File for tokens, URLs, etc.
