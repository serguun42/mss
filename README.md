# MIREA Schedule System

## Codex
* Не использовать ветку `master`.
* Перед коммитом и пушем проверяем ветку.
* **Не заливаем** конфиги, храним их *локально*. Заливаем только **образцы** конфигов, а в коде делаем проверку на конфиг (сравниваем с локальным глобальным), и/или подменяем во время CI/CD, и/или как угодно. Но не Secrets – плохо быть завязанным на архитектуру какого-либо сервиса.

## Branches
* [master](../../tree/master) – только README и общая информация
* [scrapper](../../tree/scrapper) – движок сборщика расписания, фетчит и распихивает в БД
* [telegram](../../tree/telegram) – Telegram-бот
* [backend](../../tree/backend) – Back-end для [mss.serguun42.ru](https://mss.serguun42.ru)
* [frontend](../../tree/frontend) – Frond-end для [mss.serguun42.ru](https://mss.serguun42.ru)
* [app](../../tree/app) – Android-приложение
* [nofitier](../../tree/nofitier) – обработка уведомлений (рассылка через Telegram, логгирование)
