package com.rodyapal.mss.ui.fragments.schedule

import com.airbnb.epoxy.EpoxyController
import com.rodyapal.mss.data.model.one.Lesson
import com.rodyapal.mss.item
import kotlin.random.Random

class ScheduleListController : EpoxyController() {

	var data = emptyList<Lesson>()
		set(value) {
			field = value
			requestModelBuild()
		}

	override fun buildModels() {
		data.forEach { lesson ->
			item {
				id(lesson.day * 10 + lesson.lessonIndex)
				name(lesson.name)
				data("${lesson.place}, ${lesson.tutor}, ${lesson.type}")
			}
		}
	}
}