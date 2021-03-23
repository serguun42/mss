package com.rodyapal.mss.data.repository

import com.rodyapal.mss.data.remote.RemoteDataSource
import dagger.hilt.android.scopes.ActivityRetainedScoped
import javax.inject.Inject

@ActivityRetainedScoped
class Repository @Inject constructor(
    val remote: RemoteDataSource
) {}