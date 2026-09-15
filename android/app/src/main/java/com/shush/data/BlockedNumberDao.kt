package com.shush.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface BlockedNumberDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<BlockedNumberEntity>)

    /** Drops local rows for contacts that are no longer active/blocked remotely. */
    @Query("DELETE FROM blocked_numbers WHERE supabaseId NOT IN (:activeSupabaseIds)")
    suspend fun deleteMissing(activeSupabaseIds: List<String>)

    @Query("SELECT * FROM blocked_numbers ORDER BY syncedAtEpochMillis DESC")
    suspend fun getAll(): List<BlockedNumberEntity>

    /**
     * Synchronous (non-suspend) lookup used by ShushCallScreeningService.
     * onScreenCall() is invoked off the main thread by Telecom and must
     * respond quickly, so this deliberately avoids coroutines/Flow.
     */
    @Query("SELECT * FROM blocked_numbers WHERE phoneNumberNormalized = :normalizedNumber LIMIT 1")
    fun findByNormalizedNumberBlocking(normalizedNumber: String): BlockedNumberEntity?
}
