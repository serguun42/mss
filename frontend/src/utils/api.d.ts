export function GetAllGroups(): Promise<import("../typings").TinyGroup[]>;
export function GetGroupsByName(groupName: string): Promise<import("../typings").RichGroup[]>;
export function GetGroupsByNameAndSuffix(groupName: string, groupSuffix: string): Promise<import("../typings").RichGroup[]>;
