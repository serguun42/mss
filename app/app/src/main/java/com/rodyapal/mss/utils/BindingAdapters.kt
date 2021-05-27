package com.rodyapal.mss.utils

import android.widget.TextView
import androidx.databinding.BindingAdapter
import com.rodyapal.mss.R
import java.text.SimpleDateFormat
import java.util.*

@BindingAdapter("android:setSubjectType")
fun setSubjectType(textView: TextView, type: String) = with(textView.context) {
    when (type) {
        "пр" -> textView.text = getString(R.string.lesson_type_practice)
        "лк" -> textView.text = getString(R.string.lesson_type_lection)
        "лаб" -> textView.text = getString(R.string.lesson_type_lab)
        "с/р" -> textView.text = getString(R.string.lesson_type_self_training)
        else -> textView.text = type
    }
}

@BindingAdapter("android:setStartTimeFromIndex")
fun setStartTimeFromIndex(textView: TextView, index: Int) = with(textView.context) {
    when (index) {
        0 -> textView.text = getString(R.string.lesson_start_time_first)
        1 -> textView.text = getString(R.string.lesson_start_time_second)
        2 -> textView.text = getString(R.string.lesson_start_time_third)
        3 -> textView.text = getString(R.string.lesson_start_time_fourth)
        4 -> textView.text = getString(R.string.lesson_start_time_fifth)
        5 -> textView.text = getString(R.string.lesson_start_time_sixth)
        else -> textView.text = getString(R.string.lesson_start_time_seventh)
    }
}

@BindingAdapter("android:setEndTimeFromIndex")
fun setEndTimeFromIndex(textView: TextView, index: Int) = with(textView.context) {
    when (index) {
        0 -> textView.text = getString(R.string.lesson_end_time_first)
        1 -> textView.text = getString(R.string.lesson_end_time_second)
        2 -> textView.text = getString(R.string.lesson_end_time_third)
        3 -> textView.text = getString(R.string.lesson_end_time_fourth)
        4 -> textView.text = getString(R.string.lesson_end_time_fifth)
        5 -> textView.text = getString(R.string.lesson_end_time_sixth)
        else -> textView.text = getString(R.string.lesson_end_time_seventh)
    }
}

//@BindingAdapter("android:setDayNameFromIndex")
//fun setDayNameFromIndex(textView: TextView, index: Int) = with(textView.context) {
//    when (index) {
//        1 -> textView.text = getString(R.string.day_monday)
//        2 -> textView.text = getString(R.string.day_tuesday)
//        3 -> textView.text = getString(R.string.day_wednesday)
//        4 -> textView.text = getString(R.string.day_thursday)
//        5 -> textView.text = getString(R.string.day_friday)
//        6 -> textView.text = getString(R.string.day_saturday)
//        else -> textView.text = getString(R.string.day_sunday)
//    }
//}

@BindingAdapter("android:setTextWithDate")
fun setTextWithDate(textView: TextView, dayIndex: Int) = with(textView.context) {
    val dateFormat = SimpleDateFormat("E, d.M.y", Locale.getDefault())
    val dayShiftFromCurrent = dayIndex - Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
    val time = Calendar.getInstance().apply { add(Calendar.DAY_OF_WEEK, dayShiftFromCurrent) }.time
    textView.text = dateFormat.format(time)
}