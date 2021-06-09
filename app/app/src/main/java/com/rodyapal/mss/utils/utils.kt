package com.rodyapal.mss.utils

import android.app.Activity
import android.content.Context
import android.view.inputmethod.InputMethodManager
import androidx.core.content.ContextCompat
import com.rodyapal.mss.R
import java.util.*

/**
 * @return current system time in milis
 **/
fun getCurrentTime(): Long = Calendar.getInstance().timeInMillis

fun hideKeyboard(activity: Activity) {
	val inputMethodManager = activity.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
	val currentFocusedView = activity.currentFocus
	currentFocusedView?.let {
		inputMethodManager.hideSoftInputFromWindow(currentFocusedView.windowToken, InputMethodManager.HIDE_NOT_ALWAYS)
	}
}

fun getDayIndex(dayName: String) : Int = when (dayName) {
	//According to Calendar.DAY_OF_WEEK
	//I know that hardcoding strings is bad practices, but I see no other solution
	"понедельник" -> 2
	"вторник" -> 3
	"среда" -> 4
	"четверг" -> 5
	"пятница" -> 6
	"суббота" -> 7
	else -> 1
}

fun getDayName(context: Context, dayIndex: Int) : String = with(context) {
	when (dayIndex) {
		//According to Calendar.DAY_OF_WEEK
		2 -> getString(R.string.day_monday)
		3 -> getString(R.string.day_tuesday)
		4 -> getString(R.string.day_wednesday)
		5 -> getString(R.string.day_thursday)
		6 -> getString(R.string.day_friday)
		7 -> getString(R.string.day_saturday)
		else -> getString(R.string.day_sunday)
	}
}

fun String.capital() : String = replaceFirstChar {
	if (it.isLowerCase()) it.titlecase(
		Locale.getDefault()
	) else it.toString()
}

fun getSubjectType(context: Context, type: String) : String = with(context) {
	return when (type) {
		"пр" -> getString(R.string.lesson_type_practice)
		"лк" -> getString(R.string.lesson_type_lecture)
		"лаб" -> getString(R.string.lesson_type_lab)
		"с/р" -> getString(R.string.lesson_type_self_training)
		else -> type
	}
}