package com.rodyapal.mss.data.model.all


class GroupsResponse : ArrayList<GroupName>() {

    fun toStringList() : List<String> = this.toList().map { it.name }
}