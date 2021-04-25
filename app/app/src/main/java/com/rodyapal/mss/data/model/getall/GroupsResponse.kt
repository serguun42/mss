package com.rodyapal.mss.data.model.getall


class GroupsResponse : ArrayList<GroupData>() {

    fun toStringArray() : List<String> = this.toList().map { it.name }
}