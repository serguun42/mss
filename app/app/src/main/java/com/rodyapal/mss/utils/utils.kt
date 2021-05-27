package com.rodyapal.mss.utils

import android.app.Activity
import android.content.Context
import android.view.inputmethod.InputMethodManager
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

//TODO: remove hardcode strings
fun getDayIndex(dayName: String) : Int = when (dayName) {
    "понедельник" -> 0
    "вторник" -> 1
    "среда" -> 2
    "четверг" -> 3
    "пятница" -> 4
    "суббота" -> 5
    else -> 6
}

fun String.capital() : String = replaceFirstChar {
    if (it.isLowerCase()) it.titlecase(
        Locale.getDefault()
    ) else it.toString()
}