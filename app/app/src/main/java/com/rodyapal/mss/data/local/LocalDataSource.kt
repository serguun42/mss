package com.rodyapal.mss.data.local

import com.rodyapal.mss.data.local.dao.MssDao
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.data.model.one.Group
import javax.inject.Inject

class LocalDataSource @Inject constructor(
		private val mssDao: MssDao
) {

	suspend fun insertGroup(data: Group) = mssDao.insertGroup(data)
	suspend fun insertGroupName(data: GroupName) = mssDao.insertGroupName(data)

	suspend fun deleteGroup(data: Group) = mssDao.deleteGroup(data)

	suspend fun getGroup(name: String): Group? = mssDao.getGroup(name)

	suspend fun getGroupNamesAsStrings(): List<String> = mssDao.getGroupNamesAsStrings()
	suspend fun getSavedGroupNamesAsStrings(): List<String> = mssDao.getSavedGroupNamesAsStrings()

	suspend fun getGroupNames(): List<GroupName> = mssDao.getGroupNames()
	suspend fun getSavedGroupNames(): List<GroupName> = mssDao.getSavedGroupNames()

	suspend fun sortBySuffix(): List<GroupName> = mssDao.sortBySuffix()
//	suspend fun sortByYear(): List<GroupName> = mssDao.sortByYear()

	suspend fun searchGroupName(name: String): List<GroupName> = mssDao.searchGroupName(name)

    suspend fun getSaveTime(name: String): Long = mssDao.getSaveTimeForGroup(name)
    suspend fun groupIsSaved(name: String): Boolean = mssDao.groupIsSaved(name) == 1
}