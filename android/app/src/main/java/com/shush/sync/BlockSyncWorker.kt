package com.shush.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.shush.auth.SessionStore
import com.shush.auth.SupabaseAuthClient
import com.shush.data.AppDatabase
import com.shush.data.BlockedContactsApi
import com.shush.data.BlockedNumberEntity
import com.shush.data.PhoneNumbers

/**
 * Pulls the signed-in user's active blocked contacts from Supabase and
 * mirrors them into the local Room database that ShushCallScreeningService
 * reads. Runs periodically (see SyncScheduler) and on demand.
 */
class BlockSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val sessionStore = SessionStore(applicationContext)
        var session = sessionStore.load() ?: return Result.failure()

        val authClient = SupabaseAuthClient()
        val api = BlockedContactsApi()
        val dao = AppDatabase.get(applicationContext).blockedNumberDao()

        val nowSeconds = System.currentTimeMillis() / 1000
        if (session.expiresAtEpochSeconds - nowSeconds < 60) {
            session = try {
                authClient.refresh(session.refreshToken).also { sessionStore.save(it) }
            } catch (e: Exception) {
                // Refresh token may genuinely be dead (e.g. revoked) — don't
                // retry forever in that case, but a transient network
                // failure should be retried by WorkManager's backoff policy.
                return Result.retry()
            }
        }

        return try {
            val remote = api.fetchActiveBlockedContacts(session.accessToken, session.userId)
            val entities = remote.map {
                BlockedNumberEntity(
                    supabaseId = it.id,
                    phoneNumberRaw = it.contactPhone,
                    phoneNumberNormalized = PhoneNumbers.normalize(it.contactPhone),
                    contactName = it.contactName,
                    syncedAtEpochMillis = System.currentTimeMillis()
                )
            }
            dao.upsertAll(entities)
            dao.deleteMissing(entities.map { it.supabaseId }.ifEmpty { listOf(NO_ACTIVE_IDS_SENTINEL) })
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private companion object {
        // Room's "NOT IN ()" with an empty list matches nothing on some
        // SQLite versions; pass a value that can never collide with a
        // real Supabase UUID instead of special-casing an empty delete.
        const val NO_ACTIVE_IDS_SENTINEL = "__no_active_blocked_contacts__"
    }
}
