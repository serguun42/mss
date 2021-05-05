package com.rodyapal.mss.data.model.getall


class GroupsResponse : ArrayList<GroupName>() {

    fun toStringList() : List<String> = this.toList().map { it.name }
}