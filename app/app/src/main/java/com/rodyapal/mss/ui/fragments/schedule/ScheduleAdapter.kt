package com.rodyapal.mss.ui.fragments.schedule

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.rodyapal.mss.data.model.getone.ISchedule
import com.rodyapal.mss.databinding.ScheduleListItemBinding
import com.rodyapal.mss.utils.ScheduleDiffUtils
import java.util.*

class ScheduleAdapter : RecyclerView.Adapter<ScheduleAdapter.ViewHolder>() {

    private var scheduleList = emptyList<ISchedule>()

    class ViewHolder(
        private val binding: ScheduleListItemBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(
            lessonIndex: Int, name: String, teacher: String, type: String, place: String
        ) {
            binding.lessonIndex = lessonIndex
            binding.name = name.capitalize(Locale.getDefault())
            binding.teacher = teacher
            binding.type = type
            binding.place = place
            binding.executePendingBindings()
        }

        companion object {
            fun from(parent: ViewGroup) : ViewHolder {
                val layoutInflater = LayoutInflater.from(parent.context)
                val binding = ScheduleListItemBinding.inflate(layoutInflater, parent, false)
                return ViewHolder(binding)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder
        = ViewHolder.from(parent)

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val schedule = scheduleList[position]
        holder.bind(
            position,
            schedule.name ?: "Unknown name",
            schedule.tutor ?: "Unknown tutor",
            schedule.type ?: "Unknown type",
            schedule.place ?: "Unknown place"
        )
    }

    override fun getItemCount(): Int = scheduleList.size

    fun setData(data: List<ISchedule>) {
        val diffUtil = ScheduleDiffUtils<ISchedule>(scheduleList, data)
        val diffUtilResult = DiffUtil.calculateDiff(diffUtil)
        scheduleList = data
        diffUtilResult.dispatchUpdatesTo(this)
    }
}