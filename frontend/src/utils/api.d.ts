export function GetAllGroups(): Promise<import("../types").TinyGroup[]>;
export function GetGroupsByName(groupName: string): Promise<import("../types").RichGroup[]>;
export function GetGroupsByNameAndSuffix(groupName: string, groupSuffix: string): Promise<import("../types").RichGroup[]>;
export function Stats(): Promise<import("../types").Stats>;
export function GetCurrentWeek(): Promise<number>;
