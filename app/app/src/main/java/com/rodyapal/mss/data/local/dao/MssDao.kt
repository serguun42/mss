package com.rodyapal.mss.data.local.dao

import androidx.room.*
import com.rodyapal.mss.data.model.getall.GroupName
import com.rodyapal.mss.data.model.getone.Group

@Dao
interface MssDao {

	@Insert(onConflict = OnConflictStrategy.REPLACE)
	suspend fun insertGroup(data: Group)

	@Insert(onConflict = OnConflictStrategy.REPLACE)
	suspend fun insertGroupName(data: GroupName)

	@Delete
	suspend fun deleteGroup(data: Group)

	@Query("SELECT * FROM group_table WHERE name = :name")
	suspend fun getGroup(name: String): Group?

	@Query("SELECT name FROM group_names_table")
	suspend fun getGroupNames(): List<String>

	@Query("SELECT name FROM group_table")
	suspend fun getSavedGroupNames(): List<String>

	@Query("SELECT lastTimeSaved FROM group_table WHERE name = :name")
	suspend fun getSaveTimeForGroup(name: String): Long

	@Query("SELECT COUNT(*) FROM group_table WHERE name = :name")
	suspend fun groupIsSaved(name: String): Int
}