package com.rodyapal.mss.data.model

import android.view.View
import com.rodyapal.mss.data.model.all.GroupName

interface IWeekSelector {
	fun onItemClick(weekIndex: String)
}

interface IItemClickHandler {
	fun onClickCallback(view: View, groupName: GroupName)
}
