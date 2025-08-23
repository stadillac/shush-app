// SmsReceiver.java
package com.yourcompany.shush;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "ShushSmsReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) {
            SmsMessage[] messages = Telephony.Sms.Intents.getMessagesFromIntent(intent);
            
            for (SmsMessage message : messages) {
                String sender = message.getOriginatingAddress();
                String messageBody = message.getMessageBody();
                
                Log.d(TAG, "Received SMS from: " + sender);
                
                if (isNumberBlocked(context, sender)) {
                    Log.d(TAG, "Blocking SMS from: " + sender);
                    
                    // Block the SMS by aborting the broadcast
                    abortBroadcast();
                    
                    // Store blocked message for Guardian review
                    logBlockedMessage(context, sender, messageBody);
                    break;
                }
            }
        }
    }

    private boolean isNumberBlocked(Context context, String phoneNumber) {
        DatabaseHelper dbHelper = new DatabaseHelper(context);
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

    private void logBlockedMessage(Context context, String sender, String messageBody) {
        DatabaseHelper dbHelper = new DatabaseHelper(context);
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        
        try {
            String preview = messageBody.length() > 50 ? messageBody.substring(0, 50) : messageBody;
            String sql = "INSERT INTO blocked_messages (phone_number, message_preview, blocked_at) VALUES (?, ?, ?)";
            db.execSQL(sql, new Object[]{sender, preview, System.currentTimeMillis()});
        } catch (Exception e) {
            Log.e(TAG, "Error logging blocked message", e);
        } finally {
            db.close();
        }
    }
}