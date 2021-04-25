export type QueriesForApi = {
    [queryName: string]: string | true | {
        notEncode: true;
        value: string;
    };
};

export type TinyGroup = {
	groupName: string;
	groupSuffix: string;
}

export type Option = {
	weeks?: number[]
	name: string
	type: string
	tutor?: string
	place?: string
	link?: string
}

export type Lesson = Option[];

export type DaySchedule = {
	day: string;
	odd: Lesson[];
	even: Lesson[];
}

export type RichGroup = {
	groupName: string;
	groupSuffix: string;
	remoteFile: string;
	unitName: string;
	unitCourse: string;
	lessonsTimes: string[][];
	updatedDate: Date;
	schedule: DaySchedule[];
}
