package com.rodyapal.mss.data.model.getone


import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName
import com.rodyapal.mss.utils.DB_SINGLE_GROUP_TABLE_NAME

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