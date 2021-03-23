package com.rodyapal.mss.viewmodels

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.rodyapal.mss.R
import com.rodyapal.mss.data.model.getone.SingleGroupResponse
import com.rodyapal.mss.data.remote.NetworkResult
import com.rodyapal.mss.data.repository.Repository
import com.rodyapal.mss.utils.ERROR_NETWORK_TAG
import com.rodyapal.mss.utils.handleResponse
import com.rodyapal.mss.utils.hasInternetConnection
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.lang.Exception
import javax.inject.Inject

@HiltViewModel
class ScheduleViewModel @Inject constructor(
    private val repository: Repository,
    application: Application
) : AndroidViewModel(application) {

    val group: MutableLiveData<NetworkResult<SingleGroupResponse>> = MutableLiveData()

    fun getDataForGroup(name: String) = viewModelScope.launch {
        getDataForGroupSafeCall(name)
    }

    private suspend fun getDataForGroupSafeCall(name: String) {
        group.value = NetworkResult.Loading()
        if (hasInternetConnection(getApplication())) {
            try {
                val response = repository.remote.getScheduleForGroup(name)
                group.value = handleResponse(response)
            } catch (e: Exception) {
                Log.e(ERROR_NETWORK_TAG, "Message: ${e.message}")
                group.value = NetworkResult.Error(e.message)
            }
        }
        else {
            group.value = NetworkResult.Error(
                getApplication<Application>().getString(R.string.error_no_internet_connection)
            )
        }
    }
}