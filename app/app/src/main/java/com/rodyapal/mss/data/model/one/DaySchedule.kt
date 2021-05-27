package com.rodyapal.mss.data.model.one


import com.google.gson.annotations.SerializedName

data class DaySchedule(
	@SerializedName("day")
    val day: String,
	@SerializedName("even")
    val evenWeek: List<List<Lesson>>,
	@SerializedName("odd")
    val oddWeek: List<List<Lesson>>
)