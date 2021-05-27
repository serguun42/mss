package com.rodyapal.mss.data.model.one


import com.google.gson.annotations.SerializedName

data class Lesson(

    @SerializedName("name")
    val name: String,
    @SerializedName("place")
    val place: String,
    @SerializedName("tutor")
    val tutor: String,
    @SerializedName("type")
    val type: String,

    var day: Int = -1,
    var lessonIndex: Int = -1
)