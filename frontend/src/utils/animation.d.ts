export function GlobalAnimation(iDuration: number, iStyleSettingFunc: AnimationStyleSettingFunc, iCurveStyle?: "ease-in-out" | "ripple" | "linear"): Promise<null>;
export function FadeIn(iElem: HTMLElement, iDuration: number, iOptions?: AnimationsOptionsType): Promise<string>;
export function FadeOut(iElem: HTMLElement, iDuration: number, iOptions?: AnimationsOptionsType): Promise<string>;
export function SlideDown(iElem: HTMLElement, iDuration: number, iOptions?: AnimationsOptionsType, iStyleSettingFunc?: AnimationStyleSettingFunc): Promise<string>;
export function SlideUp(iElem: HTMLElement, iDuration: number, iStyleSettingFunc?: AnimationStyleSettingFunc): Promise<string>;
export type AnimationStyleSettingFunc = (iProgress: number) => any;
export type AnimationsOptionsType = {
    display?: "block" | "flex" | "etc";
    initialOpacity?: number;
};
