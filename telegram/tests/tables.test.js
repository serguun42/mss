const { Chunkify } = require("../utils/common-utils.js");
const LessonNameByType = require("../utils/lesson-type.js");

describe("Utils for text based tables", () => {
  test("Lesson types", () => {
    expect(LessonNameByType("с/р")).toMatch(/Сам\. раб\./i);
    expect(LessonNameByType("ср")).toMatch(/Сам\. раб\./i);
    expect(LessonNameByType("П")).toMatch(/Семинар/i);
    expect(LessonNameByType("П")).not.toBe("П");
  });

  test("Chunkification", () => {
    expect(Chunkify([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
