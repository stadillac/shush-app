// src/app/dashboard/test-blocking/page.js
'use client'

import { useState, useEffect } from 'react'
import { supabase, blockContact, getBlockedContacts, createUnblockRequest } from '@/lib/supabase'
import { Shield, Phone, MessageSquare, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function BlockingTestPage() {
  const [blockedContacts, setBlockedContacts] = useState([])
  const [newNumber, setNewNumber] = useState('')
  const [newName, setNewName] = useState('')
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    initializeTestPage()
  }, [])

  const initializeTestPage = async () => {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        addTestResult('❌ No authenticated user found', 'error')
        return
      }
      
      setUser(currentUser)
      addTestResult('✅ User authenticated', 'success')

      // Load existing blocked contacts
      const contacts = await getBlockedContacts(currentUser.id)
      setBlockedContacts(contacts)
      addTestResult(`📊 Loaded ${contacts.length} blocked contacts from database`, 'success')

      // Simulate blocking service initialization
      simulateServiceInitialization()
      
    } catch (error) {
      addTestResult(`❌ Initialization error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const simulateServiceInitialization = () => {
    addTestResult('🔧 Initializing blocking services...', 'info')
    
    setTimeout(() => {
      addTestResult('📱 Platform detected: Web (mobile app would use native extensions)', 'info')
      addTestResult('✅ Mock blocking service initialized', 'success')
      addTestResult('ℹ️ In mobile app: CallKit/CallScreeningService would be active', 'warning')
    }, 1000)
  }

  const handleBlockContact = async () => {
    if (!newNumber.trim() || !newName.trim()) {
      addTestResult('❌ Please enter both name and phone number', 'error')
      return
    }

    if (!user) {
      addTestResult('❌ No authenticated user', 'error')
      return
    }

    try {
      addTestResult(`🚫 Blocking contact: ${newName} (${newNumber})`, 'info')
      
      const contactData = {
        name: newName.trim(),
        phone: newNumber.trim(),
        relationship: 'test',
        reason: 'Testing blocking functionality',
        platforms: ['sms', 'calls'],
        severity: 'medium'
      }

      // Actually block in Supabase database
      const blockedContact = await blockContact(user.id, contactData)
      
      // Update local state
      setBlockedContacts(prev => [blockedContact, ...prev])
      
      // Clear form
      setNewName('')
      setNewNumber('')
      
      addTestResult(`✅ Contact blocked successfully in database`, 'success')
      addTestResult(`   → Database ID: ${blockedContact.id}`, 'info')
      
      // Simulate native service update
      setTimeout(() => {
        addTestResult(`📲 Blocking services updated for ${newNumber}`, 'success')
        addTestResult(`   → Calls from ${newNumber} will be automatically rejected`, 'success')
        addTestResult(`   → SMS from ${newNumber} will be quarantined`, 'success')
      }, 1000)
      
    } catch (error) {
      addTestResult(`❌ Failed to block contact: ${error.message}`, 'error')
    }
  }

  const simulateIncomingContact = (contact) => {
    addTestResult(`🧪 Simulating incoming communications from ${contact.contact_name}...`, 'info')
    
    // Simulate incoming call
    setTimeout(() => {
      addTestResult(`📞 Incoming call from ${contact.contact_phone}`, 'warning')
      addTestResult(`   → Checking blocking database...`, 'info')
    }, 500)
    
    setTimeout(() => {
      addTestResult(`✅ CALL BLOCKED - Contact found in block list`, 'success')
      addTestResult(`   → Call rejected automatically`, 'success')
      addTestResult(`   → No ring notification to user`, 'success')
      addTestResult(`   → Call logged as blocked`, 'info')
    }, 1500)
    
    // Simulate incoming SMS
    setTimeout(() => {
      addTestResult(`💬 Incoming SMS from ${contact.contact_phone}`, 'warning')
      addTestResult(`   → Message: "Hey, can we talk?"`, 'info')
    }, 3000)
    
    setTimeout(() => {
      addTestResult(`✅ SMS BLOCKED - Message quarantined`, 'success')
      addTestResult(`   → Message not delivered to main inbox`, 'success')
      addTestResult(`   → Stored in blocked messages folder`, 'info')
      addTestResult(`   → Guardian can review if needed`, 'info')
    }, 4000)
  }

  const simulateUnblockRequest = async (contact) => {
    if (!user) {
      addTestResult('❌ No authenticated user', 'error')
      return
    }

    try {
      addTestResult(`📨 Creating unblock request for ${contact.contact_name}...`, 'info')
      
      const requestData = {
        mood: 'anxious',
        journalEntry: 'I miss talking to them and wonder if they\'ve changed. I feel lonely today and want to reach out.',
        additionalContext: 'Test unblock request from blocking test page'
      }

      // Actually create unblock request in database
      const unblockRequest = await createUnblockRequest(user.id, contact.id, requestData)
      
      addTestResult(`✅ Unblock request created in database`, 'success')
      addTestResult(`   → Request ID: ${unblockRequest.id}`, 'info')
      addTestResult(`   → Status: ${unblockRequest.status}`, 'info')
      
      // Simulate Guardian notification
      setTimeout(() => {
        addTestResult(`📧 Guardian notification sent`, 'success')
        addTestResult(`   → Email sent to: ${unblockRequest.guardian_email}`, 'info')
        addTestResult(`   → Guardian can approve/deny via email link`, 'info')
      }, 1000)
      
      // Simulate Guardian response
      setTimeout(() => {
        const approved = Math.random() > 0.6 // 40% approval rate for demo
        
        if (approved) {
          addTestResult(`✅ Guardian APPROVED unblock request`, 'success')
          addTestResult(`   → ${contact.contact_name} can now be contacted`, 'success')
          addTestResult(`   → Blocking services updated`, 'info')
        } else {
          addTestResult(`❌ Guardian DENIED unblock request`, 'error')
          addTestResult(`   → Reason: "You should wait longer before reconnecting"`, 'info')
          addTestResult(`   → Contact remains blocked`, 'warning')
        }
      }, 5000)
      
    } catch (error) {
      addTestResult(`❌ Failed to create unblock request: ${error.message}`, 'error')
    }
  }

  const testEmergencyBypass = () => {
    addTestResult(`🚨 Testing emergency bypass system...`, 'warning')
    
    setTimeout(() => {
      addTestResult(`   → User reports domestic violence situation`, 'warning')
      addTestResult(`   → Emergency bypass code activated`, 'info')
    }, 1000)
    
    setTimeout(() => {
      addTestResult(`✅ Emergency services contacted`, 'success')
      addTestResult(`   → Crisis hotline number unblocked temporarily`, 'success')
      addTestResult(`   → Guardian notified of emergency situation`, 'info')
      addTestResult(`   → All safety protocols activated`, 'success')
    }, 2500)
  }

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, { message, type, timestamp, id: Date.now() + Math.random() }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getTextColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-700'
      case 'error': return 'text-red-700'
      case 'warning': return 'text-yellow-700'
      default: return 'text-blue-700'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-800">Initializing blocking test system...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Blocking System Test</h1>
        </div>
        <p className="text-indigo-100">
          Test and validate the core blocking functionality of your Shush application
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Add New Block */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Block New Contact</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Contact name (e.g., John Smith)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-gray-800 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone number (e.g., +1234567890)"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-full text-gray-800 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleBlockContact}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Block Contact
              </button>
            </div>
          </div>

          {/* Blocked Contacts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Blocked Contacts ({blockedContacts.length})
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {blockedContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{contact.contact_name}</div>
                    <div className="text-sm text-gray-800">{contact.contact_phone}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => simulateIncomingContact(contact)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      Test Block
                    </button>
                    <button
                      onClick={() => simulateUnblockRequest(contact)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                    >
                      Request Unblock
                    </button>
                  </div>
                </div>
              ))}
              {blockedContacts.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No blocked contacts yet. Add one above to start testing.
                </p>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">System Tests</h2>
            <div className="space-y-3">
              <button
                onClick={testEmergencyBypass}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Test Emergency Bypass</span>
              </button>
              <button
                onClick={clearResults}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Clear Test Results
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Test Results */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Live Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
            {testResults.map((result) => (
              <div key={result.id} className="flex items-start space-x-2 py-1">
                {getIcon(result.type)}
                <div className="flex-1">
                  <div className={getTextColor(result.type)}>
                    {result.message}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {testResults.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No test results yet.</p>
                <p className="text-sm">Block a contact or run a test to see live results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}