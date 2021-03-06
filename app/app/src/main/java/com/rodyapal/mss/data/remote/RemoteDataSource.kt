package com.rodyapal.mss.data.remote

import com.rodyapal.mss.data.model.all.GroupsResponse
import com.rodyapal.mss.data.model.one.SingleGroupResponse
import retrofit2.Response
import javax.inject.Inject

class RemoteDataSource @Inject constructor(
    private val mssApi: MssApi
) {

    suspend fun getAllGroups() : Response<GroupsResponse> = mssApi.getAllGroups()

    suspend fun getScheduleForGroup(name: String) : Response<SingleGroupResponse> = mssApi.getScheduleForGroup(name)
}