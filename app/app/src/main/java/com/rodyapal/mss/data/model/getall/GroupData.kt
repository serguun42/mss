package com.rodyapal.mss.data.model.getall


import com.google.gson.annotations.SerializedName

data class GroupData(
    @SerializedName("groupName")
    val name: String,
    @SerializedName("groupSuffix")
    val suffix: String
)