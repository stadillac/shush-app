package com.shush.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * A local mirror of one row from the `blocked_contacts` table in Supabase
 * (filtered to status = 'active' and a non-null phone number). This is
 * what ShushCallScreeningService actually checks against — it must never
 * depend on a network call, since call screening has to respond in
 * milliseconds.
 */
@Entity(tableName = "blocked_numbers")
data class BlockedNumberEntity(
    @PrimaryKey
    val supabaseId: String,
    val phoneNumberRaw: String,
    val phoneNumberNormalized: String,
    val contactName: String,
    val syncedAtEpochMillis: Long
)
