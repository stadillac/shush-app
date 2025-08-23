// DatabaseHelper.java
package com.yourcompany.shush;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "shush_blocking.db";
    private static final int DATABASE_VERSION = 1;

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String createBlockedNumbers = "CREATE TABLE blocked_numbers (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "phone_number TEXT NOT NULL UNIQUE, " +
            "contact_name TEXT NOT NULL, " +
            "blocked_at INTEGER NOT NULL, " +
            "supabase_id TEXT, " +
            "sync_status TEXT DEFAULT 'pending'" +
            ")";

        String createBlockedCalls = "CREATE TABLE blocked_calls (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "phone_number TEXT NOT NULL, " +
            "blocked_at INTEGER NOT NULL" +
            ")";

        String createBlockedMessages = "CREATE TABLE blocked_messages (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "phone_number TEXT NOT NULL, " +
            "message_preview TEXT, " +
            "blocked_at INTEGER NOT NULL" +
            ")";

        db.execSQL(createBlockedNumbers);
        db.execSQL(createBlockedCalls);
        db.execSQL(createBlockedMessages);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS blocked_numbers");
        db.execSQL("DROP TABLE IF EXISTS blocked_calls");
        db.execSQL("DROP TABLE IF EXISTS blocked_messages");
        onCreate(db);
    }
}