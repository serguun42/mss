package com.rodyapal.mss.data.remote

import com.rodyapal.mss.data.model.getall.GroupsResponse
import com.rodyapal.mss.data.model.getone.SingleGroupResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface MssApi {

    @GET("/api/v1/groups?getAll")
    suspend fun getAllGroups() : Response<GroupsResponse>

    @GET("/api/v1/groups")
    suspend fun getScheduleForGroup(
        @Query("get") name: String
    ) : Response<SingleGroupResponse>
}