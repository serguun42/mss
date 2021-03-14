# MIREA Schedule System

![MSS](https://mirea.xyz/img/logo_wide.png)

## Branches and folders
* [master](./master) – общий README, смёрженные папки из других веток. Папки-ветки мёржатся КТТС.
* [scrapper](./scrapper) – движок сборщика расписания, фетчит и распихивает в БД.
* [telegram](./telegram) – Telegram-бот.
* [backend](./backend) – Back-end для [mirea.xyz](https://mirea.xyz).
* [frontend](./frontend) – Frond-end для [mirea.xyz](https://mirea.xyz).
* [app](./app) – Android-приложение.
* [nofitier](./nofitier) – обработка логов (рассылка через Telegram, логи в stdout/stderr).

## Codex
* Не коммитить в ветку `master`. Только pull-реквесты.
* Перед коммитом и пушем проверяем ветку.
* **Не заливаем** конфиги, храним их *локально*. Заливаем только **образцы** конфигов, а в коде делаем проверку на конфиг (сравниваем с локальным глобальным), и/или подменяем во время CI/CD, и/или как угодно. Но не Secrets – плохо быть завязанным на архитектуру какого-либо сервиса.
* В каждой ветке сохраняем папочную структуру и **работаем только в той папке, которая предназначена для этой ветки**.
