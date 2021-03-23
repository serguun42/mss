package com.rodyapal.mss.data.remote


sealed class NetworkResult<Type>(
    val data: Type? = null,
    val message: String? = null
) {
    class Success<Type>(data: Type) : NetworkResult<Type>(data)
    class Error<Type>(message: String?, data: Type? = null) : NetworkResult<Type>(data, message)
    class Loading<Type>() : NetworkResult<Type>()
}