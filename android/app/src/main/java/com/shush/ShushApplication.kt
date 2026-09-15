package com.shush

import android.app.Application
import com.shush.auth.SessionStore
import com.shush.sync.SyncScheduler

class ShushApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Re-arm the periodic sync job on every process start (WorkManager
        // survives reboots/process death once enqueued, but this makes
        // sure it's always scheduled for anyone already signed in).
        if (SessionStore(this).load() != null) {
            SyncScheduler.schedulePeriodic(this)
        }
    }
}
