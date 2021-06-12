package com.rodyapal.mss.data.remote

import javax.inject.Inject

class RemoteLogger @Inject constructor(
	private val mssApi: MssApi
) {
	suspend fun log(message: String) = mssApi.logError(log = message)
}