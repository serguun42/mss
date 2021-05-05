package com.rodyapal.mss.data.model.one


import com.google.gson.annotations.SerializedName

data class OddWeek (
    @SerializedName("link")
    val link: Any,
    @SerializedName("name")
    override val name: String,
    @SerializedName("place")
    override val place: String,
    @SerializedName("tutor")
    override val tutor: String,
    @SerializedName("type")
    override val type: String,
    @SerializedName("weeks")
    val weeks: Any
) : ISchedule