export type QueriesForApi = {
	[queryName: string]: string | true;
};

export type TinyGroup = {
	groupName: string;
	groupSuffix: string;
};

export type Option = {
	weeks?: number[];
	name: string;
	type: string;
	tutor?: string;
	place?: string;
	link?: string;
};

export type Lesson = Option[];

export type DaySchedule = {
	day: string;
	odd: Lesson[];
	even: Lesson[];
};

export type RichGroup = {
	groupName: string;
	groupSuffix: string;
	remoteFile: string;
	unitName: string;
	unitCourse: string;
	lessonsTimes: string[][];
	updatedDate: Date;
	schedule: DaySchedule[];
};

export type Stats = {
	groupsCount: number;
	scrapperUpdatedDate: Date;
};

export type AppsLinks = {
	title: string;
	platforms: {
		type: "google_play" | "app_store" | "git" | "web";
		url: string;
		custom_logo?: string;
	}[];
}[];
