<template>
	<div class="preloader default-no-selection">
		<div class="preloader__obfuscator"></div>
		<div class="preloader__logo">
			<div class="preloader__logo__waves">
				<div class="preloader__logo__waves__wave preloader__logo__waves__wave-1"></div>
				<div class="preloader__logo__waves__wave preloader__logo__waves__wave-2"></div>
				<div class="preloader__logo__waves__wave preloader__logo__waves__wave-3"></div>
				<div class="preloader__logo__waves__wave preloader__logo__waves__wave-4"></div>
			</div>

			<div class="preloader__logo__image default-no-selection" ref="preloader__logo__image">
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1320 1080">
					<g>
						<polygon fill="#5CC8F8" points="1003.09,0 1319.56,1080 1121.25,1080 805.08,0"/>
					</g>
					<g>
						<polygon fill="#03589C" points="515.05,0 831.52,1080 633.21,1080 317.04,0"/>
					</g>
					<g>
						<polygon fill="#5CC8F8" points="316.48,0 0,1080 198.31,1080 514.48,0"/>
					</g>
					<g>
						<polyline fill="#00A6E2" points="415.76,337.22 316.48,0 514.48,0 415.76,337.22"/>
					</g>
					<g>
						<polygon fill="#0F5097" points="570.08,187.64 415.76,337.22 514.48,0"/>
					</g>
				</svg>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "preloader",
	mounted() {
		this.$refs["preloader__logo__image"].addEventListener("contextmenu", () => false);
	}
}
</script>

<style>
.preloader {
	display: block;
	position: fixed;
	
	width: 100vw;
	height: 100vh;

	top: 0;
	left: 0;

	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.preloader__obfuscator {
	display: block;
	position: absolute;
	
	width: 100%;
	height: 100%;

	top: 0;
	left: 0;
	opacity: 0.5;

	background-color: var(--background-color);
}

.preloader__logo {
	display: block;
	position: absolute;

	width: 384px;
	height: 384px;

	left: calc(50% - 192px);
	top: calc(50% - 192px);
}

.preloader__logo__image {
	display: flex;
	flex-direction: column;
	justify-content: center;
	flex-wrap: nowrap;
	position: relative;

	width: 192px;
	height: 192px;

	margin: 96px;
	padding: 0;
	box-sizing: border-box;

	background-color: #FFF;
	border-radius: 92px;
	overflow: hidden;
}

.preloader__logo__image svg {
	display: block;
	position: relative;
	width: 70%;
	margin: 0 auto;
}

.preloader__logo__waves {
	display: block;
	position: absolute;

	width: 384px;
	height: 384px;

	left: 0;
	top: 0;

	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.preloader__logo__waves__wave {
	display: block;
	position: absolute;

	width: 384px;
	height: 384px;

	left: 0;
	top: 0;

	border-radius: 192px;
	margin: 0;
	padding: 0;
	box-sizing: border-box;

	transform-origin: center center;

	background-color: var(--primary-color-faded10);

	animation-name: waving;
	animation-duration: 2s;
	animation-timing-function: cubic-bezier(.79, .51, .42, 1);
	animation-delay: var(--animation-delay);
	animation-fill-mode: both;
	animation-iteration-count: infinite;
}

.preloader__logo__waves__wave-1 {
	--animation-delay: -1s;
}

.preloader__logo__waves__wave-2 {
	--animation-delay: -0.2s;
}

.preloader__logo__waves__wave-3 {
	--animation-delay: 0.4s;
}

.preloader__logo__waves__wave-4 {
	--animation-delay: 0.67s;
}

@keyframes waving {
	0% { transform: scale(0.4); opacity: 0.25; }
	75% { transform: scale(1); opacity: 1; }
	95% { transform: scale(1); opacity: 0; }
	98% { transform: scale(0.4); opacity: 0; }
	100% { transform: scale(0.4); opacity: 0.25; }
}
</style>