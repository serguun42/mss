package com.rodyapal.mss.data.local.dao

import androidx.room.*
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.data.model.one.Group

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
	suspend fun getGroupNamesAsStrings(): List<String>

	@Query("SELECT * FROM group_names_table")
	suspend fun getGroupNames(): List<GroupName>

	@Query("SELECT name FROM group_table")
	suspend fun getSavedGroupNamesAsStrings(): List<String>

	@Query("SELECT name, suffix FROM group_table")
	suspend fun getSavedGroupNames(): List<GroupName>

	@Query("SELECT lastTimeSaved FROM group_table WHERE name = :name")
	suspend fun getSaveTimeForGroup(name: String): Long

	@Query("SELECT COUNT(*) FROM group_table WHERE name = :name")
	suspend fun groupIsSaved(name: String): Int

	@Query("SELECT * FROM group_names_table WHERE name LIKE :searchQuery")
	suspend fun searchGroupName(searchQuery: String): List<GroupName>

	@Query("SELECT * FROM group_names_table ORDER BY suffix")
	suspend fun sortBySuffix(): List<GroupName>

//	@Query("SELECT * FROM group_names_table ORDER BY SUBSTRING(name, 8)")
//	suspend fun sortByYear(): List<GroupName>
}