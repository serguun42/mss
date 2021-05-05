package com.rodyapal.mss.data.local

import com.rodyapal.mss.data.local.dao.MssDao
import com.rodyapal.mss.data.model.getall.GroupName
import com.rodyapal.mss.data.model.getone.Group
import javax.inject.Inject

class LocalDataSource @Inject constructor(
		private val mssDao: MssDao
) {

	suspend fun insertGroup(data: Group) = mssDao.insertGroup(data)
	suspend fun insertGroupName(data: GroupName) = mssDao.insertGroupName(data)

	suspend fun deleteGroup(data: Group) = mssDao.deleteGroup(data)

	suspend fun getGroup(name: String): Group? = mssDao.getGroup(name)
	suspend fun getGroupNames(): List<String> = mssDao.getGroupNames()
	suspend fun getSavedGroupNames(): List<String> = mssDao.getSavedGroupNames()

    suspend fun getSaveTime(name: String): Long = mssDao.getSaveTimeForGroup(name)
    suspend fun groupIsSaved(name: String): Boolean = mssDao.groupIsSaved(name) == 1
}