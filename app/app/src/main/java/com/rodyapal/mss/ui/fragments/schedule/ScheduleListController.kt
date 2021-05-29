package com.rodyapal.mss.ui.fragments.schedule

import android.view.View
import com.airbnb.epoxy.EpoxyController
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.data.model.epoxy.DataBindingModels
import com.rodyapal.mss.data.model.one.Lesson
import com.rodyapal.mss.data.model.one.getSupportText
import com.rodyapal.mss.loading
import com.rodyapal.mss.scheduleHeader
import com.rodyapal.mss.scheduleItem
import kotlin.random.Random

class ScheduleListController : EpoxyController() {

	var isLoading: Boolean = false
		set(value) {
			field = value
			if (field) requestModelBuild()
		}

	var data = emptyList<Lesson>()
		set(value) {
			field = value
			isLoading = false
			requestModelBuild()
		}

	override fun buildModels() {
		if (isLoading) {
			loading {
				id("loading_state")
			}
			return
		}

		var previousDay = -1
		var headerId = 0
		var itemId = 0
		data.forEach { lesson ->
			if (lesson.day != previousDay)
				scheduleHeader {
					id(headerId++)
					dayIndex(lesson.day)
				}

			scheduleItem {
				id(itemId++)
				name(lesson.name)
				data(lesson.getSupportText())
				lessonIndex(lesson.lessonIndex)
			}
			previousDay = lesson.day
		}
	}
}