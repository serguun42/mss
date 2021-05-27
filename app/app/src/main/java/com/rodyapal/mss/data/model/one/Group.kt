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
		for ((index, lesson) in schedule.evenWeek.filter { it.isNotEmpty() }.withIndex()) {
			lesson[0].day = getDayIndex(schedule.day)
			lesson[0].lessonIndex = index
		}
	}
}

fun Group.getWeekSchedule(evenWeek: Boolean): List<Lesson> = with(schedule) {
	val result = mutableListOf<Lesson>()
	forEach { daySchedule ->
		if (evenWeek)
			result.addAll(daySchedule.evenWeek.filter { it.isNotEmpty() }.map { it[0] })
		else
			result.addAll(daySchedule.oddWeek.filter { it.isNotEmpty() }.map { it[0] })
	}
	return result
}