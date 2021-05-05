package com.rodyapal.mss.ui.fragments.login

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.databinding.GroupNameListItemBinding
import com.rodyapal.mss.utils.ScheduleDiffUtils

class LoginAdapter(
    private val onItemClickListener: OnItemClickListener
) : RecyclerView.Adapter<LoginAdapter.ViewHolder>() {

    private var groupNames = emptyList<GroupName>()

    interface OnItemClickListener {
        fun onClick(view: View, groupName: GroupName)
    }

    class ViewHolder(
        private val binding: GroupNameListItemBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(groupName: GroupName, onItemClickListener: OnItemClickListener) {
            binding.groupName = groupName
            binding.root.setOnClickListener { onItemClickListener.onClick(binding.root, groupName) }
            binding.executePendingBindings()
        }

        companion object {
            fun from(parent: ViewGroup) : ViewHolder {
                val layoutInflater = LayoutInflater.from(parent.context)
                val binding = GroupNameListItemBinding.inflate(layoutInflater, parent, false)
                return ViewHolder(binding)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder = ViewHolder.from(parent)

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(groupNames[position], onItemClickListener)
    }

    override fun getItemCount(): Int = groupNames.size

    fun setData(data: List<GroupName>) {
        val diffUtil = ScheduleDiffUtils<GroupName>(groupNames, data)
        val diffUtilResult = DiffUtil.calculateDiff(diffUtil)
        groupNames = data
        diffUtilResult.dispatchUpdatesTo(this)
    }
}