// ios/ShushApp/ShushBlockingModule.swift
import Foundation
import React
import SQLite3
import CallKit

@objc(ShushBlockingModule)
class ShushBlockingModule: RCTEventEmitter {
    private let databasePath: String
    
    override init() {
        let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.yourcompany.shush")!
        databasePath = containerURL.appendingPathComponent("blocked_numbers.db").path
        super.init()
        setupDatabase()
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["onCallBlocked", "onMessageBlocked", "onSyncComplete"]
    }
    
    @objc
    func blockNumber(_ phoneNumber: String, contactName: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .background).async {
            do {
                try self.addBlockedNumber(phoneNumber, contactName: contactName)
                try self.reloadCallDirectoryExtension()
                
                DispatchQueue.main.async {
                    resolver(["success": true, "phoneNumber": phoneNumber])
                }
            } catch {
                DispatchQueue.main.async {
                    rejecter("BLOCK_ERROR", "Failed to block number: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func unblockNumber(_ phoneNumber: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .background).async {
            do {
                try self.removeBlockedNumber(phoneNumber)
                try self.reloadCallDirectoryExtension()
                
                DispatchQueue.main.async {
                    resolver(["success": true, "phoneNumber": phoneNumber])
                }
            } catch {
                DispatchQueue.main.async {
                    rejecter("UNBLOCK_ERROR", "Failed to unblock number: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func getBlockedNumbers(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.global(qos: .background).async {
            do {
                let numbers = try self.fetchBlockedNumbers()
                DispatchQueue.main.async {
                    resolver(numbers)
                }
            } catch {
                DispatchQueue.main.async {
                    rejecter("FETCH_ERROR", "Failed to fetch blocked numbers: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    // Database operations
    private func setupDatabase() {
        var database: OpaquePointer?
        
        if sqlite3_open(databasePath, &database) == SQLITE_OK {
            let createTable = """
                CREATE TABLE IF NOT EXISTS blocked_numbers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone_number TEXT NOT NULL UNIQUE,
                    contact_name TEXT NOT NULL,
                    blocked_at INTEGER NOT NULL,
                    supabase_id TEXT,
                    sync_status TEXT DEFAULT 'pending'
                );
                
                CREATE TABLE IF NOT EXISTS blocked_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone_number TEXT NOT NULL,
                    message_preview TEXT,
                    blocked_at INTEGER NOT NULL
                );
            """
            
            if sqlite3_exec(database, createTable, nil, nil, nil) != SQLITE_OK {
                print("Failed to create database tables")
            }
        }
        
        sqlite3_close(database)
    }
    
    private func addBlockedNumber(_ phoneNumber: String, contactName: String) throws {
        var database: OpaquePointer?
        
        guard sqlite3_open(databasePath, &database) == SQLITE_OK else {
            throw NSError(domain: "DatabaseError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to open database"])
        }
        
        let query = "INSERT OR REPLACE INTO blocked_numbers (phone_number, contact_name, blocked_at) VALUES (?, ?, ?)"
        var statement: OpaquePointer?
        
        if sqlite3_prepare_v2(database, query, -1, &statement, nil) == SQLITE_OK {
            sqlite3_bind_text(statement, 1, phoneNumber, -1, nil)
            sqlite3_bind_text(statement, 2, contactName, -1, nil)
            sqlite3_bind_int64(statement, 3, Int64(Date().timeIntervalSince1970))
            
            if sqlite3_step(statement) != SQLITE_DONE {
                throw NSError(domain: "DatabaseError", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to insert blocked number"])
            }
        }
        
        sqlite3_finalize(statement)
        sqlite3_close(database)
    }
    
    private func reloadCallDirectoryExtension() throws {
        CXCallDirectoryManager.sharedInstance.reloadExtension(withIdentifier: "com.yourcompany.shush.CallDirectory") { error in
            if let error = error {
                print("Failed to reload CallKit extension: \(error)")
            } else {
                print("CallKit extension reloaded successfully")
            }
        }
    }
}