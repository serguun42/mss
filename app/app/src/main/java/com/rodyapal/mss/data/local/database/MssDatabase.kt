package com.rodyapal.mss.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.rodyapal.mss.data.local.converters.DatabaseTypeConverter
import com.rodyapal.mss.data.local.dao.MssDao
import com.rodyapal.mss.data.model.all.GroupName
import com.rodyapal.mss.data.model.one.Group

@Database(entities = [Group::class, GroupName::class], version = 5)
@TypeConverters(DatabaseTypeConverter::class)
abstract class MssDatabase : RoomDatabase() {

    abstract fun mssDao(): MssDao
}