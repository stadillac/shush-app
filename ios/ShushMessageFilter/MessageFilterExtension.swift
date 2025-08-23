// ShushMessageFilter/MessageFilterExtension.swift
import IdentityLookup
import SQLite3

class MessageFilterExtension: ILMessageFilterExtension {
    private let databasePath: String
    
    override init() {
        let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.yourcompany.shush")!
        databasePath = containerURL.appendingPathComponent("blocked_numbers.db").path
        super.init()
    }
    
    override func handle(_ queryRequest: ILMessageFilterQueryRequest, context: ILMessageFilterExtensionContext, completion: @escaping (ILMessageFilterQueryResponse) -> Void) {
        
        let response = ILMessageFilterQueryResponse()
        
        // Check if sender is blocked
        if let sender = queryRequest.sender, isNumberBlocked(sender) {
            response.action = .filter
            logBlockedMessage(from: sender, message: queryRequest.messageBody)
        } else {
            response.action = .allow
        }
        
        completion(response)
    }
    
    private func isNumberBlocked(_ phoneNumber: String) -> Bool {
        var database: OpaquePointer?
        var isBlocked = false
        
        if sqlite3_open_v2(databasePath, &database, SQLITE_OPEN_READONLY, nil) == SQLITE_OK {
            let query = "SELECT COUNT(*) FROM blocked_numbers WHERE phone_number = ?"
            var statement: OpaquePointer?
            
            if sqlite3_prepare_v2(database, query, -1, &statement, nil) == SQLITE_OK {
                sqlite3_bind_text(statement, 1, phoneNumber, -1, nil)
                
                if sqlite3_step(statement) == SQLITE_ROW {
                    let count = sqlite3_column_int(statement, 0)
                    isBlocked = count > 0
                }
            }
            
            sqlite3_finalize(statement)
            sqlite3_close(database)
        }
        
        return isBlocked
    }
    
    private func logBlockedMessage(from sender: String, message: String?) {
        // Log blocked message for Guardian review
        var database: OpaquePointer?
        
        if sqlite3_open(databasePath, &database) == SQLITE_OK {
            let query = "INSERT INTO blocked_messages (phone_number, message_preview, blocked_at) VALUES (?, ?, ?)"
            var statement: OpaquePointer?
            
            if sqlite3_prepare_v2(database, query, -1, &statement, nil) == SQLITE_OK {
                sqlite3_bind_text(statement, 1, sender, -1, nil)
                let preview = String(message?.prefix(50) ?? "")
                sqlite3_bind_text(statement, 2, preview, -1, nil)
                sqlite3_bind_int64(statement, 3, Int64(Date().timeIntervalSince1970))
                
                sqlite3_step(statement)
            }
            
            sqlite3_finalize(statement)
            sqlite3_close(database)
        }
    }
}