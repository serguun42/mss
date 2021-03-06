package com.rodyapal.mss.data.model.all

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName
import com.rodyapal.mss.utils.DB_GROUP_NAMES_TABLE_NAME

@Entity(tableName = DB_GROUP_NAMES_TABLE_NAME)
data class GroupName(
		@SerializedName("groupName")
		@PrimaryKey(autoGenerate = false)
		val name: String,

		@SerializedName("groupSuffix")
		val suffix: String
)