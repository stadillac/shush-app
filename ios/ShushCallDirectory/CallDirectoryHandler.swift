// ShushCallDirectory/CallDirectoryHandler.swift
import Foundation
import CallKit
import SQLite3

class CallDirectoryHandler: CXCallDirectoryProvider {
    private let databasePath: String
    
    override init() {
        // Shared app group container
        let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.yourcompany.shush")!
        databasePath = containerURL.appendingPathComponent("blocked_numbers.db").path
        super.init()
    }
    
    override func beginRequest(with context: CXCallDirectoryExtensionContext) throws {
        let blockedNumbers = try getBlockedNumbers()
        
        // Add blocked numbers to CallKit
        for number in blockedNumbers.sorted() {
            guard let phoneNumber = CXCallDirectoryPhoneNumber(number) else { continue }
            context.addBlockingEntry(withNextSequentialPhoneNumber: phoneNumber)
        }
        
        try context.completeRequest()
    }
    
    private func getBlockedNumbers() throws -> [String] {
        var database: OpaquePointer?
        var numbers: [String] = []
        
        if sqlite3_open(databasePath, &database) == SQLITE_OK {
            let query = "SELECT phone_number FROM blocked_numbers"
            var statement: OpaquePointer?
            
            if sqlite3_prepare_v2(database, query, -1, &statement, nil) == SQLITE_OK {
                while sqlite3_step(statement) == SQLITE_ROW {
                    if let phoneNumber = sqlite3_column_text(statement, 0) {
                        numbers.append(String(cString: phoneNumber))
                    }
                }
            }
            
            sqlite3_finalize(statement)
            sqlite3_close(database)
        }
        
        return numbers
    }
}