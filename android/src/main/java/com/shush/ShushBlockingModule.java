// ShushBlockingModule.java
package com.yourcompany.shush;

import android.Manifest;
import android.app.role.RoleManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Build;
import android.telecom.TelecomManager;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ShushBlockingModule extends ReactContextBaseJavaModule {
    private DatabaseHelper dbHelper;
    private ReactApplicationContext reactContext;

    public ShushBlockingModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.dbHelper = new DatabaseHelper(context);
    }

    @Override
    public String getName() {
        return "ShushBlockingModule";
    }

    @ReactMethod
    public void requestPermissions(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Request Call Screening role
                RoleManager roleManager = (RoleManager) reactContext.getSystemService(Context.ROLE_SERVICE);
                if (roleManager != null && !roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                    Intent intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING);
                    getCurrentActivity().startActivityForResult(intent, 1001);
                }
            }

            // Check SMS permissions
            boolean hasSmsPermission = ActivityCompat.checkSelfPermission(reactContext, 
                Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED;

            WritableMap result = Arguments.createMap();
            result.putBoolean("callScreening", true); // Will be set after user grants
            result.putBoolean("smsReceiving", hasSmsPermission);
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("PERMISSION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void blockNumber(String phoneNumber, String contactName, Promise promise) {
        try {
            SQLiteDatabase db = dbHelper.getWritableDatabase();
            
            ContentValues values = new ContentValues();
            values.put("phone_number", phoneNumber);
            values.put("contact_name", contactName);
            values.put("blocked_at", System.currentTimeMillis());
            values.put("sync_status", "pending");
            
            long result = db.insertWithOnConflict("blocked_numbers", null, values, 
                SQLiteDatabase.CONFLICT_REPLACE);
            
            db.close();
            
            if (result != -1) {
                // Emit event to React Native
                WritableMap params = Arguments.createMap();
                params.putString("phoneNumber", phoneNumber);
                params.putString("contactName", contactName);
                params.putString("action", "blocked");
                
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onNumberBlocked", params);
                
                WritableMap response = Arguments.createMap();
                response.putBoolean("success", true);
                response.putString("phoneNumber", phoneNumber);
                promise.resolve(response);
            } else {
                promise.reject("DATABASE_ERROR", "Failed to insert blocked number");
            }
        } catch (Exception e) {
            promise.reject("BLOCK_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void unblockNumber(String phoneNumber, Promise promise) {
        try {
            SQLiteDatabase db = dbHelper.getWritableDatabase();
            
            int rowsDeleted = db.delete("blocked_numbers", "phone_number = ?", 
                new String[]{phoneNumber});
            
            db.close();
            
            if (rowsDeleted > 0) {
                WritableMap params = Arguments.createMap();
                params.putString("phoneNumber", phoneNumber);
                params.putString("action", "unblocked");
                
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onNumberUnblocked", params);
                
                WritableMap response = Arguments.createMap();
                response.putBoolean("success", true);
                response.putString("phoneNumber", phoneNumber);
                promise.resolve(response);
            } else {
                promise.reject("NOT_FOUND", "Phone number not found in blocked list");
            }
        } catch (Exception e) {
            promise.reject("UNBLOCK_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getBlockedNumbers(Promise promise) {
        try {
            SQLiteDatabase db = dbHelper.getReadableDatabase();
            Cursor cursor = db.query("blocked_numbers", null, null, null, null, null, "blocked_at DESC");
            
            WritableArray result = Arguments.createArray();
            
            while (cursor.moveToNext()) {
                WritableMap item = Arguments.createMap();
                item.putString("phoneNumber", cursor.getString(cursor.getColumnIndex("phone_number")));
                item.putString("contactName", cursor.getString(cursor.getColumnIndex("contact_name")));
                item.putDouble("blockedAt", cursor.getLong(cursor.getColumnIndex("blocked_at")));
                item.putString("supabaseId", cursor.getString(cursor.getColumnIndex("supabase_id")));
                result.pushMap(item);
            }
            
            cursor.close();
            db.close();
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("FETCH_ERROR", e.getMessage());
        }
    }
}