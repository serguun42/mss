package com.rodyapal.mss.ui.fragments.login

import com.airbnb.epoxy.EpoxyController
import com.rodyapal.mss.data.model.IItemClickHandler
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.groupNameItem
import com.rodyapal.mss.shimmerGroupNameItem

class LoginListController(
	private val onItemClickListener: IItemClickHandler
) : EpoxyController() {

	var isLoading = false
		set(value) {
			field = value
			if (field) requestModelBuild()
		}

	var data = emptyList<GroupName>()
		set(value) {
			field = value
			isLoading = false
			requestModelBuild()
		}

	override fun buildModels() {
		if (isLoading) {
			for (id in 0..12) shimmerGroupNameItem {
				id(id)
			}
			return
		}

		var groupNameItemId = 0
		data.forEach { group ->
			groupNameItem {
				id(groupNameItemId++)
				groupName(group)
				onItemClickHandler(this@LoginListController.onItemClickListener)
			}
		}
	}
}