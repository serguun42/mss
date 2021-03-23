package com.rodyapal.mss.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import com.rodyapal.mss.data.remote.NetworkResult
import retrofit2.Response

fun hasInternetConnection(context: Context): Boolean {
    val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    val activeNetwork = connectivityManager.activeNetwork ?: return false
    val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return false
    return when {
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> true
        else -> false
    }
}

fun <Type> handleResponse(response: Response<Type>): NetworkResult<Type> =
    when {
        response.isSuccessful -> {
            NetworkResult.Success(response.body()!!)
        }
        else -> {
            Log.e(
                ERROR_NETWORK_TAG,
                "Message: \n${response.message()}\nResponse: \n${response.toString()}"
            )
            NetworkResult.Error(response.message())
        }
    }