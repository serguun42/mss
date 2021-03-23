package com.rodyapal.mss.data.model.getone


import com.google.gson.annotations.SerializedName

data class Schedule(
    @SerializedName("day")
    val day: String,
    @SerializedName("even")
    val evenWeek: List<List<EvenWeek>>,
    @SerializedName("odd")
    val oddWeek: List<List<OddWeek>>
)