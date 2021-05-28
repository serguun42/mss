package com.rodyapal.mss.ui.fragments.schedule

import com.airbnb.epoxy.EpoxyController
import com.rodyapal.mss.data.model.epoxy.DataBindingModels
import com.rodyapal.mss.data.model.one.Lesson
import com.rodyapal.mss.header
import com.rodyapal.mss.item
import com.rodyapal.mss.loading
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
				header {
					id(headerId++)
					dayIndex(lesson.day)
				}

			item {
				id(itemId++)
				name(lesson.name)
				data("${lesson.place}, ${lesson.tutor}, ${lesson.type}")
				lessonIndex(lesson.lessonIndex)
			}
			previousDay = lesson.day
		}
	}
}