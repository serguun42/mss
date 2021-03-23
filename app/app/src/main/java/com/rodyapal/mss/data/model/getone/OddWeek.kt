package com.rodyapal.mss.data.model.getone


import com.google.gson.annotations.SerializedName

data class OddWeek(
    @SerializedName("link")
    val link: Any,
    @SerializedName("name")
    val name: String,
    @SerializedName("place")
    val place: String,
    @SerializedName("tutor")
    val tutor: String,
    @SerializedName("type")
    val type: String,
    @SerializedName("weeks")
    val weeks: Any
)