package com.rodyapal.mss.di

import android.content.Context
import androidx.room.Room
import com.rodyapal.mss.data.local.dao.MssDao
import com.rodyapal.mss.data.local.database.MssDatabase
import com.rodyapal.mss.utils.DB_NAME
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Singleton
    @Provides
    fun provideDatabase(@ApplicationContext context: Context): MssDatabase =
            Room
                    .databaseBuilder(context, MssDatabase::class.java, DB_NAME)
                    .fallbackToDestructiveMigration()
                    .build()

    @Singleton
    @Provides
    fun provideDao(database: MssDatabase): MssDao = database.mssDao()
}