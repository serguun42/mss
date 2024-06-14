<template>
	<a class="preview default-no-select default-pointer" :href="previewLink" target="_blank">
		<div class="preview__background"></div>
		<div class="preview__logo" ref="logo"></div>
		<div class="preview__title" ref="title"></div>
		<div class="preview__text-short" ref="text-short"></div>
		<div class="preview__text-long" ref="text-long"></div>
		<div class="preview__button" ref="button"></div>
		<div class="preview__mascot" ref="mascot"></div>
	</a>
</template>

<script>
import Dispatcher from "@/utils/dispatcher";
import { GlobalAnimation, FadeIn } from "@/utils/animation";

/**
 * @param {Record<string, HTMLDivElement>} refs
 */
const animatePreview = (refs) => {
	if (!refs) return;

	const { logo, title, "text-short": textShort, "text-long": textLong, button, mascot } = refs;
	if (!logo || !title || !textShort || !button || !mascot) return;

	FadeIn(logo, 500)
		.then(() => FadeIn(title, 500))
		.then(() => FadeIn(textShort, 500))
		.then(() => FadeIn(textLong, 500))
		.then(() => FadeIn(button, 500))
		.then(() => FadeIn(mascot, 250))
		.then(() =>
			GlobalAnimation(750, (progress) => {
				mascot.style.top = `${(100 - progress * 32).toFixed(2)}%`;
			})
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1 + progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1.2 - progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1 + progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1.2 - progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(
			() =>
				new Promise((resolve) => {
					setTimeout(() => resolve(), 1200);
				})
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1 + progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1.2 - progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1 + progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(
				400,
				(progress) => {
					button.style.transform = `scale(${(1.2 - progress / 5).toFixed(3)})`;
				},
				"ease-in-out"
			)
		)
		.then(() =>
			GlobalAnimation(750, (progress) => {
				mascot.style.top = `${(68 + progress * 50).toFixed(2)}%`;
			})
		);
};

export default {
	name: "preview",
	data() {
		return {
			previewLink: process.env.VUE_APP_PREVIEW_LINK
		};
	},
	mounted() {
		let animationWasFired = false;

		const refs = this.$refs;

		Dispatcher.link("preloadingDone", () => {
			if (animationWasFired) return;
			animationWasFired = true;
			setTimeout(() => animatePreview(refs), 200);
		});

		setTimeout(() => {
			if (animationWasFired) return;
			animationWasFired = true;
			animatePreview(refs);
		}, 1500);
	}
};
</script>

<style scoped>
.preview {
	--preview-size-block: 1px;

	display: block;
	position: relative;

	margin: 24px auto;
	padding: calc(var(--preview-size-block) * 20) calc(var(--preview-size-block) * 10) calc(var(--preview-size-block) * 12);
	box-sizing: border-box;

	width: calc(var(--preview-size-block) * 300);
	height: calc(var(--preview-size-block) * 250);

	overflow: hidden;
	border-radius: calc(var(--preview-size-block) * 10);
}

.preview * {
	box-sizing: border-box;
}

@media (min-width: 1000px) {
	.preview {
		--preview-size-block: 1.75px;
	}
}

@media (max-width: 1000px) and (min-width: 600px) {
	.preview {
		--preview-size-block: calc((100vw - 32px) / 300 / 2);
	}
}

@media (max-width: 600px) {
	.preview {
		--preview-size-block: calc((100vw - 32px) / 300);
	}
}

.preview__background {
	display: block;
	position: absolute;

	width: 100%;
	height: 100%;
	top: 0;
	left: 0;

	background-image: url("../../public/preview/background.png");
	background-position: center center;
	background-size: cover;
	background-repeat: no-repeat;
}

.preview__logo {
	display: block;
	position: relative;

	width: calc(var(--preview-size-block) * 120);
	height: calc(var(--preview-size-block) * 20);

	margin: 0 auto calc(var(--preview-size-block) * 12);
	padding: 0;

	background-image: url("../../public/preview/logo.svg");
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;

	opacity: 0;
}

.preview__title {
	display: block;
	position: relative;

	width: calc(var(--preview-size-block) * 278);
	height: calc(var(--preview-size-block) * 44);

	margin: calc(var(--preview-size-block) * 12) auto;
	padding: 0;

	background-image: url("../../public/preview/title.svg");
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;

	opacity: 0;
}

.preview__text-short {
	display: block;
	position: relative;

	width: calc(var(--preview-size-block) * 269);
	height: calc(var(--preview-size-block) * 28);

	margin: calc(var(--preview-size-block) * 12) auto;
	padding: 0;

	background-image: url("../../public/preview/text-short.svg");
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;

	opacity: 0;
}

.preview__text-long {
	display: block;
	position: relative;

	width: calc(var(--preview-size-block) * 256);
	height: calc(var(--preview-size-block) * 42);

	margin: calc(var(--preview-size-block) * 12) auto;
	padding: 0;

	background-image: url("../../public/preview/text-long.svg");
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;

	opacity: 0;
}

.preview__button {
	display: block;
	position: relative;

	width: calc(var(--preview-size-block) * 142);
	height: calc(var(--preview-size-block) * 28);

	margin: calc(var(--preview-size-block) * 12) auto calc(var(--preview-size-block) * 20);
	padding: 0;

	background-image: url("../../public/preview/button.svg");
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;

	opacity: 0;
}

.preview__mascot {
	display: block;
	position: absolute;

	top: 100%;
	left: calc(var(--preview-size-block) * -10);

	width: calc(var(--preview-size-block) * 90);
	height: calc(var(--preview-size-block) * 93);

	margin: 0;
	padding: 0;

	background-image: url("../../public/preview/mascot.svg");
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;
}
</style>
