package com.rodyapal.mss.viewmodels

import android.app.Application
import android.view.View
import android.widget.SearchView
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.navigation.findNavController
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.data.repository.Repository
import com.rodyapal.mss.ui.fragments.login.LoginFragmentDirections
import com.rodyapal.mss.utils.hasInternetConnection
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

interface IItemClickHandler {
    fun onClickCallback(view: View, groupName: GroupName)
}

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val repository: Repository,
    application: Application
) : AndroidViewModel(application) {

    private val _groups: MutableLiveData<List<GroupName>> = MutableLiveData()
    val groups: LiveData<List<GroupName>> get() = _groups

    fun getAllGroups() = viewModelScope.launch {
        _groups.value = repository.getGroupNames(hasInternetConnection(getApplication()))
    }

    private fun navigateToScheduleFragment(view: View, groupName: String) {
        val action = LoginFragmentDirections.actionLoginFragmentToScheduleFragment(groupName.dropLastWhile { it == ' ' })
        view.findNavController().navigate(action)
    }

    val onItemClickListener = object : IItemClickHandler {
        override fun onClickCallback(view: View, groupName: GroupName) {
            navigateToScheduleFragment(view, groupName.name)
        }
    }

    private fun searchGroupName(query: String?): Boolean {
        query?.let {
            viewModelScope.launch {
                _groups.value = repository.searchGroupName(it)
            }
        }
        return true
    }

    val onQueryTextListener = object : SearchView.OnQueryTextListener {
        override fun onQueryTextSubmit(query: String?): Boolean = searchGroupName(query)

        override fun onQueryTextChange(newText: String?): Boolean = searchGroupName(newText)
    }

    fun sortBySuffix() = viewModelScope.launch {
        _groups.value = repository.sortBySuffix()
    }

//    fun sortByYear() = viewModelScope.launch {
//        _groups.value = repository.sortByYear()
//    }
}