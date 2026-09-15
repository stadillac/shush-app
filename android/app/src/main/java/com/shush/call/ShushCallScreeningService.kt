package com.shush.call

import android.telecom.Call
import android.telecom.CallScreeningService
import android.telecom.CallScreeningService.CallResponse
import android.util.Log
import com.shush.data.AppDatabase
import com.shush.data.PhoneNumbers

/**
 * The actual enforcement point: Android's Telecom framework invokes
 * onScreenCall() for every incoming call once the user has granted this
 * app the CALL_SCREENING role (see MainActivity.requestCallScreeningRole).
 *
 * This must respond fast and must not depend on the network — it only
 * ever reads the local Room mirror that BlockSyncWorker keeps up to date.
 */
class ShushCallScreeningService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        val incomingNumber = callDetails.handle?.schemeSpecificPart
        val normalized = PhoneNumbers.normalize(incomingNumber)

        val isBlocked = normalized.isNotEmpty() &&
            AppDatabase.get(applicationContext)
                .blockedNumberDao()
                .findByNormalizedNumberBlocking(normalized) != null

        Log.d(TAG, "Screening call from $incomingNumber (normalized=$normalized) -> blocked=$isBlocked")

        val response = CallResponse.Builder()
            .setDisallowCall(isBlocked)
            .setRejectCall(isBlocked)
            .setSkipNotification(isBlocked)
            .setSkipCallLog(false) // keep it in Recents so the user/Guardian can see what was blocked
            .build()

        respondToCall(callDetails, response)
    }

    private companion object {
        const val TAG = "ShushCallScreening"
    }
}
