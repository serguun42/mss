package com.rodyapal.mss.viewmodels

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.rodyapal.mss.R
import com.rodyapal.mss.data.model.getall.GroupsResponse
import com.rodyapal.mss.data.remote.NetworkResult
import com.rodyapal.mss.data.repository.Repository
import com.rodyapal.mss.utils.ERROR_NETWORK_TAG
import com.rodyapal.mss.utils.handleResponse
import com.rodyapal.mss.utils.hasInternetConnection
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val repository: Repository,
    application: Application
) : AndroidViewModel(application) {

    val groupsResponse: MutableLiveData<NetworkResult<GroupsResponse>> = MutableLiveData()

    fun getAllGroups() = viewModelScope.launch {
        getAllGroupsSafeCall()
    }

    private suspend fun getAllGroupsSafeCall() {
        groupsResponse.value = NetworkResult.Loading()
        if (hasInternetConnection(getApplication())) {
            try {
                val response = repository.remote.getAllGroups()
                groupsResponse.value = handleResponse(response)
            } catch (e: Exception) {
                Log.e(ERROR_NETWORK_TAG, "Message: ${e.message}")
                groupsResponse.value = NetworkResult.Error(e.message)
            }
        } else {
            groupsResponse.value = NetworkResult.Error(
                getApplication<Application>().getString(R.string.error_no_internet_connection)
            )
        }
    }
}