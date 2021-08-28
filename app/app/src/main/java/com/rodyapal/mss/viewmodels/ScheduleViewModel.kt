package com.rodyapal.mss.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.rodyapal.mss.data.model.one.DaySchedule
import com.rodyapal.mss.data.model.one.Group
import com.rodyapal.mss.data.model.one.Lesson
import com.rodyapal.mss.data.repository.Repository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

@HiltViewModel
class ScheduleViewModel @Inject constructor(
    private val repository: Repository,
    application: Application
) : AndroidViewModel(application) {

    private val currentTimeInMillis get() = Calendar.getInstance().timeInMillis

    private val firstTermStartInMillis = Calendar.getInstance().apply {
        set(Calendar.getInstance().get(Calendar.YEAR), 9, 1, 0, 0)
    }.timeInMillis

    private val secondTermStartInMillis = Calendar.getInstance().apply {
        set(Calendar.getInstance().get(Calendar.YEAR), 1, 8, 0, 0)
    }.timeInMillis

    private val DEBUG_TAG = "SCHEDULE_VIEW_MODEL_DEBUG"

    private val _group: MutableLiveData<Group> = MutableLiveData()
    val group: LiveData<Group> get() = _group

    var groupName: String = ""
        set(value) {
            field = value
            getDataForGroup(value)
        }

    fun getDataForGroup(name: String) = viewModelScope.launch {
        _group.value = repository.getGroup(name)
    }

    fun refreshDataForGroup(name: String) = viewModelScope.launch {
        _group.value = repository.refreshGroup(name)
    }

    fun getCurrentWeekFromTermStart(): Int =
        ((currentTimeInMillis - getTermStart()) / (7 * 24 * 3600000)).toInt() + 1

    fun getCurrentDay(): Int =
        ((currentTimeInMillis - getTermStart()) / (24 * 3600000) % 7).toInt() - 1

    fun getTermStart(): Long =
        if (currentTimeInMillis < secondTermStartInMillis) firstTermStartInMillis
        else secondTermStartInMillis

    /**
     * @return list of lessons for day based on current week (even or odd)
     **/
    fun getTimetableForDayWeekBased(schedule: DaySchedule): List<Lesson> {
        val week = getCurrentWeekFromTermStart()
        return if (week % 2 == 0) schedule.evenWeek.filter { it.isNotEmpty() }.flatten() else schedule.oddWeek.filter { it.isNotEmpty() }.map { it[0] }
    }

    /**
     * @return DaySchedule object for current day
     **/
    fun getScheduleForCurrentDay(schedules: List<DaySchedule>): DaySchedule? {
        val day = getCurrentDay()
        return if(day <= 5) schedules[day] else null
    }

    fun getDayFromSchedule(schedules: List<DaySchedule>) : String? {
        return getScheduleForCurrentDay(schedules)?.day
    }
}