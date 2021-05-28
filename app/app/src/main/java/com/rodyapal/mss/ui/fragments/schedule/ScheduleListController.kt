package com.rodyapal.mss.ui.fragments.schedule

import com.airbnb.epoxy.EpoxyController
import com.rodyapal.mss.data.model.one.Lesson
import com.rodyapal.mss.header
import com.rodyapal.mss.item
import kotlin.random.Random

class ScheduleListController : EpoxyController() {

	var data = emptyList<Lesson>()
		set(value) {
			field = value
			requestModelBuild()
		}

	override fun buildModels() {
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