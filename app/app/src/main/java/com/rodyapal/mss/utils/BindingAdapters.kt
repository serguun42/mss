package com.rodyapal.mss.utils

import android.widget.TextView
import androidx.databinding.BindingAdapter

@BindingAdapter("android:setSubjectType")
fun setSubjectType(textView: TextView, type: String) {
    when (type) {
        "пр" -> textView.text = "Практическая"
        "лк" -> textView.text = "Лекция"
        "лаб" -> textView.text = "Лабораторная"
        "с/р" -> textView.text = "Самоподготовка"
        else -> textView.text = ""
    }
}

@BindingAdapter("android:setStartTimeFromIndex")
fun setStartTimeFromIndex(textView: TextView, index: Int) {
    when (index) {
        0 -> textView.text = "09:00"
        1 -> textView.text = "10:40"
        2 -> textView.text = "12:40"
        4 -> textView.text = "16:20"
        else -> textView.text = "18:00"
    }
}