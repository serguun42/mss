package com.rodyapal.mss.data.repository

import android.util.Log
import com.rodyapal.mss.data.local.LocalDataSource
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.data.model.one.Group
import com.rodyapal.mss.data.model.one.normalizeLessonsData
import com.rodyapal.mss.data.remote.NetworkResult
import com.rodyapal.mss.data.remote.RemoteDataSource
import com.rodyapal.mss.utils.*
import dagger.hilt.android.scopes.ActivityRetainedScoped
import javax.inject.Inject
import kotlin.math.abs

private const val DEBUG_TAG = "REPOSITORY_LOG"

@ActivityRetainedScoped
class Repository @Inject constructor(
		private val remote: RemoteDataSource,
		private val local: LocalDataSource
) {

	suspend fun getGroupNamesAsStrings(internetConnection: Boolean) : List<String> {
		return if (internetConnection) {
			val names = local.getGroupNamesAsStrings()
			if (names.isEmpty()) {
				fetchGroupNames()
				local.getGroupNamesAsStrings()
			} else names
		} else {
			local.getSavedGroupNamesAsStrings()
		}
	}

	suspend fun getGroupNames(internetConnection: Boolean) : List<GroupName> {
		return if (internetConnection) {
			val names = local.getGroupNames()
			if (names.isEmpty()) {
				fetchGroupNames()
				local.getGroupNames()
			} else names
		} else {
			local.getSavedGroupNames()
		}
	}

	private suspend fun fetchGroupNames() {
		when (val result = handleResponse(remote.getAllGroups())) {
			is NetworkResult.Loading -> Log.d(LOG_NETWORK_TAG, "Network loading...")
			is NetworkResult.Error -> Log.e(ERROR_NETWORK_TAG, result.message ?: "No message")
			is NetworkResult.Success -> {
				result.data?.let {
					for (name in it) local.insertGroupName(name)
				}
			}
		}
	}

	suspend fun searchGroupName(query: String): List<GroupName> = local.searchGroupName("%$query%")
	suspend fun sortBySuffix(): List<GroupName> = local.sortBySuffix()
//	suspend fun sortByYear(): List<GroupName> = local.sortByYear()

	suspend fun getGroup(name: String) : Group {
		if (!local.groupIsSaved(name) || !upToDate(name)) {
			fetchGroup(name)
		}
		return local.getGroup(name)!!
	}

	suspend fun refreshGroup(name: String) : Group {
		fetchGroup(name)
		return local.getGroup(name)!!
	}

	private suspend fun upToDate(name: String): Boolean = abs(getCurrentTime() - local.getSaveTime(name)) < FRESH_DATA_TIMEOUT

	private suspend fun fetchGroup(name: String) {
		val response = remote.getScheduleForGroup(name)
		when (val result = handleResponse(response)) {
			is NetworkResult.Loading -> Log.d(LOG_NETWORK_TAG, "Network loading...")
			is NetworkResult.Error -> Log.e(ERROR_NETWORK_TAG, result.message ?: "No message")
			is NetworkResult.Success -> {
				if (result.data != null) {
					Log.d(DEBUG_TAG, "Data for $name refreshed")
					local.insertGroup(
							result.data[0].apply {
								lastTimeSaved = getCurrentTime()
								normalizeLessonsData()
							}
					)
				} else {
					Log.d(DEBUG_TAG, "Data for $name is NULL")
				}
			}
		}
	}
}
