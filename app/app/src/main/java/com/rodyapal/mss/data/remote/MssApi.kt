package com.rodyapal.mss.data.remote

import com.rodyapal.mss.data.model.all.GroupsResponse
import com.rodyapal.mss.data.model.one.SingleGroupResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface MssApi {

    @GET("/api/v1.1/groups/all")
    suspend fun getAllGroups() : Response<GroupsResponse>

    @GET("/api/v1.1/groups/certain")
    suspend fun getScheduleForGroup(
        @Query("name") name: String
    ) : Response<SingleGroupResponse>
}