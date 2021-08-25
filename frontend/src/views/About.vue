<template>
	<div id="about-page">
		<div id="header" class="default-header">О проекте</div>

		<div class="card">
			<div class="card__header default-header">Что это</div>
			<div class="card__content">
				<p><a href="https://mirea.xyz/" target="_blank">mirea.xyz</a>, также известный как «MSS» (MIREA Schedule System) – совместный проект двух студентов <i>какой-то группы</i>, сделанный <i>типа</i> для задания по предмету <i>«Ознакомительная практика»</i>.</p>

				<p>На самом деле, у одного из двух человечков шило в попе не давало спокойно сидеть на месте, и сначала он сделал standalone <a href="https://t.me/mirea_table_bot" target="_blank" rel="noopener noreferrer">Telegram-бота</a> для расписания своей группы. Ботом пользовалась часть группы, всё было ок.</p>

				<p>А потом наступил следующий семестр, и для практики надо было пилить какой угодно проект в группах. Было принято стратегически верное решение: совместить приятное с полезным и расширить бота до чего-то большего. В группу вошли два студента: один отвечает за бота и сайт, второй за Android-приложение. Проект стал доступен для всех групп, а не только одной.</p>

				<p>Так и получился этот проект – MSS.</p>
			</div>
		</div>

		<div class="card">
			<div class="card__header default-header">Код</div>
			<div class="card__content">
				<p>
					Весь код проекта доступен на <a href="https://github.com/serguun42/mss" target="_blank" rel="noopener noreferrer">Github</a>. Ставь звёдочку, а если найдёшь баги или будут пожелания – пиши в <a href="https://github.com/serguun42/mss/issues" target="_blank" rel="noopener noreferrer">Issues</a>.
				</p>
				<p>
					Сделано всё <strike>на костылях, велосипедах и непонятно чём</strike> преимущественно на JS: бэк на Node.js, фронт на Vue, бот с помощью <a href="https://www.npmjs.com/package/telegraf" target="_blank" rel="noopener noreferrer">Telegraf</a>. Android-приложение на Kotlin.
				</p>
			</div>
		</div>

		<div class="card">
			<div class="card__header default-header">Юридическая информация</div>
			<div class="card__content">
				<p>
					Этот проект, всё его содержимое и разработчики не связаны с администрацией РТУ МИРЭА.
				</p>
				<p>
					<a href="https://github.com/serguun42/mss/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">Лицензия</a>
				</p>
				<p>
					<router-link to="/privacy">Политика в отношении обработки персональных данных</router-link>
				</p>
			</div>
		</div>
	</div>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
export default {
	name: "about",
	created() {
		Dispatcher.call("preloadingDone");
	}
}
</script>

<style scoped>
#about-page {
	display: block;
	position: relative;

	padding: 2em 0 0;
	box-sizing: border-box;
}

#header {
	font-size: 28px;
}

.card {
	display: block;
	position: relative;

	width: calc(100% - 16px);
	max-width: 600px;
	margin: 0 auto;
	padding: 16px;
	box-sizing: border-box;

	border-radius: 8px;
	background-color: var(--card-color);
	color: var(--text-color);
	box-shadow: 0 1px 4px 1px rgba(100, 100, 100, 0.05);

	transition: box-shadow 150ms ease-in-out 0s;
}

.card:hover {
	box-shadow: 0 1px 6px 2px rgba(100, 100, 100, 0.2);
}

.card:not(:last-of-type) {
	margin-bottom: 2em;
}

.card__header {
	text-align: left;
	margin-bottom: 0.5em;
}

</style>