package com.rodyapal.mss.ui.fragments.schedule

import com.airbnb.epoxy.EpoxyController
import com.rodyapal.mss.data.model.IWeekSelector
import com.rodyapal.mss.weekIndexItem

class WeekPickerListController(
	private val itemCallbackHandler: IWeekSelector
) : EpoxyController() {

	override fun buildModels() {
		for (week in 1..16)
			weekIndexItem {
				id(week)
				weekIndex(week.toString())
				onItemClickHandler(this@WeekPickerListController.itemCallbackHandler)
			}
	}
}