// src/app/dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { Shield, Users, Heart, AlertTriangle, CheckCircle, Plus, Loader2 } from 'lucide-react'
import { supabase, getBlockedContacts, getUserGuardian } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [blockedContacts, setBlockedContacts] = useState([])
  const [guardian, setGuardian] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        const [contactsData, guardianData] = await Promise.all([
          getBlockedContacts(user.id),
          getUserGuardian(user.id)
        ])

        setBlockedContacts(contactsData)
        setGuardian(guardianData)
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const calculateDaysSince = (blockedDate) => {
    const blocked = new Date(blockedDate)
    const today = new Date()
    const diffTime = Math.abs(today - blocked)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateStreak = () => {
    if (blockedContacts.length === 0) return 0
    const oldestBlock = blockedContacts.reduce((oldest, contact) => {
      const contactDate = new Date(contact.blocked_at)
      const oldestDate = new Date(oldest.blocked_at)
      return contactDate < oldestDate ? contact : oldest
    })
    return calculateDaysSince(oldestBlock.blocked_at)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const impulseFreeStreak = calculateStreak()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-800">Welcome back, {user?.email}</p>
        </div>
        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-medium">Shush</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-sm text-gray-800 hover:text-gray-800"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-xl font-semibold text-green-800">
              {impulseFreeStreak} Days Impulse-Free!
            </h3>
            <p className="text-green-700">
              {impulseFreeStreak > 0 
                ? "You're building healthy digital habits. Keep it up!" 
                : "Start your journey by blocking your first harmful contact."
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/block')}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Shield className="h-5 w-5 mr-2" />
                Block Someone New
              </button>
              <button 
                onClick={() => router.push('/blocked')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                View Blocked Contacts ({blockedContacts.length})
              </button>
              <button 
                onClick={() => router.push('/dashboard/test-blocking')}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center border-2 border-purple-300"
              >
                {/* <TestTube className="h-5 w-5 mr-2" /> */}
                Test Blocking System
              </button>
            </div>
          </div>

          {/* Blocked Contacts Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-xl font-semibold">Recent Blocks</h2>
              <button 
                onClick={() => router.push('/blocked')}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            {blockedContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No blocked contacts yet.</p>
                <p className="text-sm">Block harmful contacts to protect your digital wellbeing.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blockedContacts.slice(0, 2).map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{contact.contact_name}</h3>
                        <p className="text-sm text-gray-800 mt-1">{contact.reason}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {calculateDaysSince(contact.blocked_at)} days ago
                        </p>
                      </div>
                      <button 
                        onClick={() => router.push(`/unblock-request/${contact.id}`)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                      >
                        Request Unblock
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {contact.platforms.map((platform, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guardian Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Your Guardian
            </h2>
            
            {guardian ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800">{guardian.guardian_name}</h3>
                  <p className="text-green-700 text-sm">{guardian.relationship_type}</p>
                  <p className="text-green-600 text-xs mt-1">{guardian.guardian_email}</p>
                </div>
                <button 
                  onClick={() => router.push('/guardian')}
                  className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Manage Guardian
                </button>
              </>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">No Guardian assigned</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    Add a trusted person to help with unblock decisions
                  </p>
                </div>
                <button 
                  onClick={() => router.push('/guardian/add')}
                  className="w-full mt-4 bg-indigo-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Guardian
                </button>
              </>
            )}
          </div>

          {/* Crisis Resources */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Need Help?
            </h2>
            <div className="space-y-3">
              <a 
                href="sms:741741" 
                className="block w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors text-center"
              >
                Crisis Text Line
              </a>
              <a 
                href="tel:988" 
                className="block w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors text-center"
              >
                Suicide Prevention (988)
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Progress</h2>
            <div className="space-y-3 text-gray-900">
              <div className="flex justify-between text-sm">
                <span>Impulse-free streak</span>
                <span className="font-medium">{impulseFreeStreak} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total contacts blocked</span>
                <span className="font-medium">{blockedContacts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Guardian status</span>
                <span className="font-medium">{guardian ? 'Active' : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
