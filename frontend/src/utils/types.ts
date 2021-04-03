export type QueriesForApiType = {
    [queryName: string]: string | true | {
        notEncode: true;
        value: string;
    };
};

export type TinyGroupType = {
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

export type GroupSchedule = {
	day: string;
	odd: Lesson[];
	even: Lesson[];
}

export type RichGroupType = {
	groupName: string;
	groupSuffix: string;
	remoteFile: string;
	unitName: string;
	unitCourse: string;
	lessonsTimes: string[][];
	updatedDate: Date;
	schedule: GroupSchedule[];
}
