package com.rodyapal.mss.utils

import android.widget.TextView
import androidx.databinding.BindingAdapter
import com.rodyapal.mss.R

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
        3 -> textView.text = getString(R.string.lesson_start_time_fouth)
        4 -> textView.text = getString(R.string.lesson_start_time_fifth)
        6 -> textView.text = getString(R.string.lesson_start_time_sixth)
        else -> textView.text = getString(R.string.lesson_start_time_seventh)
    }
}