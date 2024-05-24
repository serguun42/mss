/**
 * @callback AnimationStyleSettingFunc
 * @param {number} iProgress
 */
/**
 * @param {number} iDuration
 * @param {AnimationStyleSettingFunc} iStyleSettingFunc - Function for setting props by progress
 * @param {"ease-in-out"|"ripple"|"linear"} [iCurveStyle="ease-in-out"] - Curve Style
 * @returns {Promise<null>}
 */
export const GlobalAnimation = (iDuration, iStyleSettingFunc, iCurveStyle = "ease-in-out") =>
	new Promise((resolve) => {
		const startTime = performance.now();

		const LocalAnimation = (iPassedTime) => {
			iPassedTime = iPassedTime - startTime;
			if (iPassedTime < 0) iPassedTime = 0;

			let cProgress = iPassedTime / iDuration;
			if (cProgress >= 1) {
				iStyleSettingFunc(1);
				resolve();
				return;
			}

			if (iCurveStyle == "ease-in-out") {
				if (cProgress < 0.5) cProgress = Math.pow(cProgress * 2, 2.75) / 2;
				else cProgress = 1 - Math.pow((1 - cProgress) * 2, 2.75) / 2;
			} else if (iCurveStyle == "ripple") {
				cProgress = 0.6 * Math.pow(cProgress, 1 / 3) + 1.8 * Math.pow(cProgress, 2 / 3) - 1.4 * cProgress;
			}

			iStyleSettingFunc(cProgress);

			requestAnimationFrame(LocalAnimation);
		};

		requestAnimationFrame(LocalAnimation);
	});

/**
 * @typedef {Object} AnimationsOptionsType
 * @property {"block" | "flex" | "etc"} [display]
 * @property {number} [initialOpacity]
 */
/**
 * @param {HTMLElement} iElem
 * @param {number} iDuration
 * @param {AnimationsOptionsType} [iOptions]
 * @returns {Promise<void>}
 */
export const FadeIn = (iElem, iDuration, iOptions) => {
	if (!iElem || !(iElem instanceof HTMLElement)) return Promise.resolve();
	if (!iOptions) iOptions = {};
	if (!iOptions.initialOpacity) iOptions.initialOpacity = 0;
	if (!iOptions.display) iOptions.display = "block";

	iElem.style.opacity = iOptions.initialOpacity;
	iElem.style.display = iOptions.display;

	return GlobalAnimation(
		iDuration,
		(iProgress) => {
			iElem.style.opacity = (1 - iOptions.initialOpacity) * iProgress + iOptions.initialOpacity;
		},
		"ease-in-out"
	);
};

/**
 * @param {HTMLElement} iElem
 * @param {number} iDuration
 * @param {AnimationsOptionsType} [iOptions]
 * @returns {Promise<void>}
 */
export const FadeOut = (iElem, iDuration, iOptions) => {
	if (!iElem || !(iElem instanceof HTMLElement)) return Promise.resolve();
	if (!iOptions) iOptions = {};
	if (!iOptions.initialOpacity) iOptions.initialOpacity = 1;

	iElem.style.opacity = iOptions.initialOpacity;

	return GlobalAnimation(
		iDuration,
		(iProgress) => {
			iElem.style.opacity = (1 - iProgress) * iOptions.initialOpacity;
		},
		"ease-in-out"
	).then(() => {
		iElem.style.display = "none";
		return Promise.resolve();
	});
};

/**
 * @param {HTMLElement} iElem
 * @param {number} iDuration
 * @param {AnimationsOptionsType} [iOptions]
 * @param {AnimationStyleSettingFunc} [iStyleSettingFunc]
 * @returns {Promise<void>}
 */
export const SlideDown = (iElem, iDuration, iOptions, iStyleSettingFunc) => {
	if (!iElem || !(iElem instanceof HTMLElement)) return Promise.resolve();
	if (!iOptions) iOptions = {};
	if (!iOptions.display) iOptions.display = "block";

	const finalHeight =
		parseInt(iElem.dataset.targetHeight || getComputedStyle(iElem).height || "0") ||
		(() => {
			iElem.style.opacity = 0;
			iElem.style.display = iOptions.display;
			const heightGorFromTweak =
				parseInt(iElem.dataset.targetHeight || getComputedStyle(iElem).height || "0") || 0;
			iElem.style.display = "none";
			iElem.style.opacity = 1;
			return heightGorFromTweak;
		})() ||
		0;

	const marginTop = parseInt(getComputedStyle(iElem).marginTop || "0") || 0,
		marginBottom = parseInt(getComputedStyle(iElem).marginBottom || "0") || 0,
		paddingTop = parseInt(getComputedStyle(iElem).paddingTop || "0") || 0,
		paddingBottom = parseInt(getComputedStyle(iElem).paddingTop || "0") || 0;

	iElem.style.display = iOptions.display;
	iElem.style.overflow = "hidden";
	iElem.style.height = 0;
	iElem.style.marginTop = 0;
	iElem.style.marginBottom = 0;
	iElem.style.paddingTop = 0;
	iElem.style.paddingBottom = 0;
	iElem.dataset.targetHeight = finalHeight;

	return GlobalAnimation(
		iDuration,
		(iProgress) => {
			iElem.style.height = `${iProgress * finalHeight}px`;
			iElem.style.marginTop = `${iProgress * marginTop}px`;
			iElem.style.marginBottom = `${iProgress * marginBottom}px`;
			iElem.style.paddingTop = `${iProgress * paddingTop}px`;
			iElem.style.paddingBottom = `${iProgress * paddingBottom}px`;

			if (iStyleSettingFunc) iStyleSettingFunc(iProgress);
		},
		"ease-in-out"
	).then(() => {
		iElem.style.removeProperty("height");
		iElem.style.removeProperty("overflow");
		iElem.style.removeProperty("margin-top");
		iElem.style.removeProperty("margin-bottom");
		iElem.style.removeProperty("padding-top");
		iElem.style.removeProperty("padding-bottom");
		return Promise.resolve();
	});
};

/**
 * @param {HTMLElement} iElem
 * @param {number} iDuration
 * @param {AnimationStyleSettingFunc} [iStyleSettingFunc]
 * @returns {Promise<void>}
 */
export const SlideUp = (iElem, iDuration, iStyleSettingFunc) => {
	if (!iElem || !(iElem instanceof HTMLElement)) return Promise.resolve();

	const initSize = iElem.clientHeight,
		marginTop = parseInt(getComputedStyle(iElem).marginTop || "0") || 0,
		marginBottom = parseInt(getComputedStyle(iElem).marginBottom || "0") || 0,
		paddingTop = parseInt(getComputedStyle(iElem).paddingTop || "0") || 0,
		paddingBottom = parseInt(getComputedStyle(iElem).paddingTop || "0") || 0;

	iElem.style.overflow = "hidden";

	return GlobalAnimation(
		iDuration,
		(iProgress) => {
			iElem.style.height = `${(1 - iProgress) * initSize}px`;
			iElem.style.marginTop = `${(1 - iProgress) * marginTop}px`;
			iElem.style.marginBottom = `${(1 - iProgress) * marginBottom}px`;
			iElem.style.paddingTop = `${(1 - iProgress) * paddingTop}px`;
			iElem.style.paddingBottom = `${(1 - iProgress) * paddingBottom}px`;

			if (iStyleSettingFunc) iStyleSettingFunc(iProgress);
		},
		"ease-in-out"
	).then(() => {
		iElem.style.display = "none";
		iElem.style.removeProperty("height");
		iElem.style.removeProperty("overflow");
		iElem.style.removeProperty("margin-top");
		iElem.style.removeProperty("margin-bottom");
		iElem.style.removeProperty("padding-top");
		iElem.style.removeProperty("padding-bottom");
		return Promise.resolve();
	});
};
