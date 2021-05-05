package com.rodyapal.mss.data.local.converters

import androidx.room.ProvidedTypeConverter
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.rodyapal.mss.data.model.getone.DaySchedule
import com.rodyapal.mss.data.model.getone.Group

class DatabaseTypeConverter {

    val gson = Gson()

    @TypeConverter
    fun groupToGson(data: Group): String = gson.toJson(data)

    @TypeConverter
    fun stringToGson(data: String): Group {
        val listType = object : TypeToken<Group>() {}.type
        return gson.fromJson(data, listType)
    }

    @TypeConverter
    fun daySchedulesToGson(data: List<DaySchedule>): String = gson.toJson(data)

    @TypeConverter
    fun gsonToDaySchedules(data: String): List<DaySchedule> {
        val listType = object : TypeToken<List<DaySchedule>>() {}.type
        return gson.fromJson(data, listType)
    }

    @TypeConverter
    fun lessonsTimesToGson(data: List<List<String>>): String = gson.toJson(data)

    @TypeConverter
    fun gsonToLessonsTimes(data: String): List<List<String>> {
        val listType = object : TypeToken<List<List<String>>>() {}.type
        return gson.fromJson(data, listType)
    }
}