package com.rodyapal.mss.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.rodyapal.mss.data.model.one.DaySchedule
import com.rodyapal.mss.data.model.one.Group
import com.rodyapal.mss.data.model.one.ISchedule
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

    private val DEBUG_TAG = "SCHEDULE_VIEW_MODEL_DEBUG"

    private val _group: MutableLiveData<Group> = MutableLiveData()
    val group: LiveData<Group> get() = _group

    fun getDataForGroup(name: String) = viewModelScope.launch {
        _group.value = repository.getGroup(name)
    }

    fun getCurrentWeekFromTermStart(): Int =
        ((Calendar.getInstance().timeInMillis - Calendar.getInstance().apply {
        set(2021, 1, 8, 0, 0)
    }.timeInMillis) / (7 * 24 * 3600000)).toInt() + 1

    fun getCurrentDay(): Int =
        ((Calendar.getInstance().timeInMillis - Calendar.getInstance().apply {
        set(2021, 1, 8, 0, 0)
    }.timeInMillis) / (24 * 3600000) % 7).toInt() - 1

    /**
     * @return list of lessons for day based on current week (even or odd)
     **/
    fun getTimetableForDayWeekBased(schedule: DaySchedule): List<ISchedule> {
        val week = getCurrentWeekFromTermStart()
        return if (week % 2 == 0) schedule.evenWeek.filter { it.isNotEmpty() }.map { it[0] } else schedule.oddWeek.filter { it.isNotEmpty() }.map { it[0] }
    }

    /**
     * @return DaySchedule object for current day
     **/
    fun getScheduleForCurrentDay(schedules: List<DaySchedule>): DaySchedule {
        val day = getCurrentDay()
        return if(day <= 5) schedules[day] else schedules[5]
    }

    fun getDayFromSchedule(schedules: List<DaySchedule>) : String {
        return getScheduleForCurrentDay(schedules).day
    }
}