// CallScreeningService.java
package com.yourcompany.shush;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.telecom.Call;
import android.telecom.CallScreeningService;
import android.util.Log;

public class ShushCallScreeningService extends CallScreeningService {
    private static final String TAG = "ShushCallScreening";
    private DatabaseHelper dbHelper;

    @Override
    public void onCreate() {
        super.onCreate();
        dbHelper = new DatabaseHelper(this);
    }

    @Override
    public void onScreenCall(Call.Details callDetails) {
        String phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
        Log.d(TAG, "Screening call from: " + phoneNumber);

        if (isNumberBlocked(phoneNumber)) {
            Log.d(TAG, "Blocking call from: " + phoneNumber);
            
            // Block the call
            CallResponse response = new CallResponse.Builder()
                .setDisconnectCause(new android.telecom.DisconnectCause(android.telecom.DisconnectCause.REJECTED))
                .setSkipNotification(true)
                .setSkipCallLog(false)
                .build();
            
            respondToCall(callDetails, response);
            logBlockedCall(phoneNumber);
        } else {
            Log.d(TAG, "Allowing call from: " + phoneNumber);
        }
    }

    private boolean isNumberBlocked(String phoneNumber) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = null;
        
        try {
            cursor = db.query("blocked_numbers", 
                new String[]{"phone_number"}, 
                "phone_number = ?", 
                new String[]{phoneNumber}, 
                null, null, null);
            
            return cursor.getCount() > 0;
        } catch (Exception e) {
            Log.e(TAG, "Error checking blocked number", e);
            return false;
        } finally {
            if (cursor != null) cursor.close();
            db.close();
        }
    }

    private void logBlockedCall(String phoneNumber) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        
        try {
            String sql = "INSERT INTO blocked_calls (phone_number, blocked_at) VALUES (?, ?)";
            db.execSQL(sql, new Object[]{phoneNumber, System.currentTimeMillis()});
        } catch (Exception e) {
            Log.e(TAG, "Error logging blocked call", e);
        } finally {
            db.close();
        }
    }
}