package com.rodyapal.mss.data.remote

import com.rodyapal.mss.data.model.all.GroupsResponse
import com.rodyapal.mss.data.model.one.SingleGroupResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface MssApi {

    @GET("/api/v1.2/groups/all")
    suspend fun getAllGroups() : Response<GroupsResponse>

    @GET("/api/v1.2/groups/certain")
    suspend fun getScheduleForGroup(
        @Query("name") name: String
    ) : Response<SingleGroupResponse>

    @POST("/api/v1.2/logs/post")
    suspend fun logError(
        @Query("source") source: String = "app",
        @Body log: String
    )
}