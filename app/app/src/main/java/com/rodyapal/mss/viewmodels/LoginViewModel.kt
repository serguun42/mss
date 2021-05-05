package com.rodyapal.mss.viewmodels

import android.app.Application
import android.util.Log
import android.view.View
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.navigation.findNavController
import com.rodyapal.mss.R
import com.rodyapal.mss.data.remote.NetworkResult
import com.rodyapal.mss.data.repository.Repository
import com.rodyapal.mss.ui.fragments.login.LoginFragmentDirections
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

    private val _groups: MutableLiveData<List<String>> = MutableLiveData()
    val groups: LiveData<List<String>> get() = _groups

    fun getAllGroups() = viewModelScope.launch {
        _groups.value = repository.getGroupNames(hasInternetConnection(getApplication()))
    }

    fun navigateToScheduleFragment(view: View, groupName: String) {
        val action = LoginFragmentDirections.actionLoginFragmentToScheduleFragment(groupName.dropLastWhile { it == ' ' })
        view.findNavController().navigate(action)
    }
}