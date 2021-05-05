package com.rodyapal.mss.utils

import java.util.concurrent.TimeUnit

const val MSS_BASE_URL = "https://mirea.xyz"
const val READ_TIMEOUT = 10L //Seconds
const val CONNECT_TIMEOUT = 10L //Seconds
const val ERROR_NETWORK_TAG = "NETWORK ERROR"
const val LOG_NETWORK_TAG = "NETWORK STATUS LOG"
const val DB_SINGLE_GROUP_TABLE_NAME = "group_table"
const val DB_GROUP_NAMES_TABLE_NAME = "group_names_table"
const val DB_UPDATE_TIME_TABLE_NAME = "database_last_update_time"
const val DB_NAME = "mss_database"

val FRESH_DATA_TIMEOUT = TimeUnit.DAYS.toMillis(1)