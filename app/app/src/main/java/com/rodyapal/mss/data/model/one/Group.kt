package com.rodyapal.mss.data.model.one


import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName
import com.rodyapal.mss.utils.DB_SINGLE_GROUP_TABLE_NAME
import com.rodyapal.mss.utils.getDayIndex

@Entity(tableName = DB_SINGLE_GROUP_TABLE_NAME)
data class Group(
	@SerializedName("groupName")
	@PrimaryKey(autoGenerate = false)
	val name: String,

	@SerializedName("groupSuffix")
	val suffix: String,

	@SerializedName("lessonsTimes")
	val lessonsTimes: List<List<String>>,

	@SerializedName("remoteFile")
	val remoteFile: String,

	@SerializedName("schedule")
	val schedule: List<DaySchedule>,

	@SerializedName("unitCourse")
	val unitCourse: String,

	@SerializedName("unitName")
	val unitName: String,

	@SerializedName("updatedDate")
	val updatedDate: String,

	var lastTimeSaved: Long = 0
)

fun Group.normalizeLessonsData() {
	schedule.forEach { schedule ->
		for ((index, lesson) in schedule.evenWeek.withIndex()) {
			lesson.forEach {
				it.day = getDayIndex(schedule.day)
				it.lessonIndex = index
			}
		}
		for ((index, lesson) in schedule.oddWeek.withIndex()) {
			lesson.forEach {
				it.day = getDayIndex(schedule.day)
				it.lessonIndex = index
			}
		}
	}
}

fun Group.getWeekSchedule(weekIndex: Int): List<Lesson> = with(schedule) {
	val result = mutableListOf<Lesson>()
	forEach { daySchedule ->
		if (weekIndex % 2 == 0)
			result.addAll(daySchedule.evenWeek.flatten().filter { it.weeks == null || it.weeks.contains(weekIndex) })
		else
			result.addAll(daySchedule.oddWeek.flatten().filter { it.weeks == null || it.weeks.contains(weekIndex) })
	}
	return result
}