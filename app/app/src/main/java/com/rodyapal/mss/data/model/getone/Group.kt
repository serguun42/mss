package com.rodyapal.mss.data.model.getone


import com.google.gson.annotations.SerializedName

data class Group(
    @SerializedName("groupName")
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
    val updatedDate: String
)