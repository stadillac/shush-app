// src/app/guardian/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  Plus, 
  User, 
  Mail, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit,
  Shield,
  MessageSquare,
  Calendar,
  Star,
  Loader2
} from 'lucide-react'

// Mock functions - replace with your actual supabase functions
const getUserGuardians = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: '1',
      guardian_name: 'Sarah Johnson',
      guardian_email: 'sarah@example.com',
      guardian_phone: '+1 (555) 123-4567',
      relationship_type: 'friend',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      last_active: '2024-01-20T15:30:00Z',
      requests_handled: 12,
      emergency_contact: true,
      backup_order: 1
    },
    {
      id: '2',
      guardian_name: 'Mom',
      guardian_email: 'mom@example.com',
      guardian_phone: '+1 (555) 987-6543',
      relationship_type: 'family',
      status: 'pending',
      created_at: '2024-01-18T14:00:00Z',
      last_active: null,
      requests_handled: 0,
      emergency_contact: false,
      backup_order: 2
    }
  ]
}

const removeGuardian = async (guardianId) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true }
}

const resendInvitation = async (guardianId) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true }
}

export default function GuardianManagementPage() {
  const [guardians, setGuardians] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const router = useRouter()

  useEffect(() => {
    loadGuardians()
  }, [])

  const loadGuardians = async () => {
    try {
      setLoading(true)
      const userId = 'mock-user-id' // Replace with actual user ID
      const data = await getUserGuardians(userId)
      setGuardians(data)
    } catch (err) {
      setError('Failed to load Guardians')
      console.error('Load guardians error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveGuardian = async (guardianId) => {
    try {
      setActionLoading(guardianId)
      await removeGuardian(guardianId)
      setGuardians(prev => prev.filter(g => g.id !== guardianId))
      setShowDeleteConfirm(null)
    } catch (err) {
      setError('Failed to remove Guardian')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResendInvitation = async (guardianId) => {
    try {
      setActionLoading(guardianId)
      await resendInvitation(guardianId)
      // Show success message (you could add a toast notification here)
    } catch (err) {
      setError('Failed to resend invitation')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-800 bg-green-100',
          icon: CheckCircle,
          text: 'Active'
        }
      case 'pending':
        return {
          color: 'text-yellow-800 bg-yellow-100',
          icon: Clock,
          text: 'Pending'
        }
      case 'declined':
        return {
          color: 'text-red-800 bg-red-100',
          icon: AlertTriangle,
          text: 'Declined'
        }
      default:
        return {
          color: 'text-gray-800 bg-gray-100',
          icon: Clock,
          text: 'Unknown'
        }
    }
  }

  const getRelationshipLabel = (type) => {
    const labels = {
      family: 'Family Member',
      friend: 'Close Friend',
      therapist: 'Therapist/Counselor',
      sponsor: 'Sponsor/Mentor',
      partner: 'Romantic Partner',
      other: 'Other'
    }
    return labels[type] || 'Unknown'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const activeGuardians = guardians.filter(g => g.status === 'active')
  const pendingGuardians = guardians.filter(g => g.status === 'pending')
  const canAddMore = guardians.length < 3 // Max 3 guardians

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Heart className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Guardians</h1>
            <p className="text-gray-800">Manage the people who help protect your digital boundaries</p>
          </div>
        </div>
        {canAddMore && (
          <button
            onClick={() => router.push('/guardian/add')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Guardian
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-800">Active Guardians</p>
              <p className="text-2xl font-bold text-gray-900">{activeGuardians.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-800">Total Requests Handled</p>
              <p className="text-2xl font-bold text-gray-900">
                {guardians.reduce((sum, g) => sum + g.requests_handled, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-800">Pending Invitations</p>
              <p className="text-2xl font-bold text-gray-900">{pendingGuardians.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guardian List */}
      {guardians.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Guardians Yet</h3>
          <p className="text-gray-800 mb-6">
            Add trusted people to help you maintain healthy digital boundaries. 
            Guardians help you make thoughtful decisions about unblocking contacts.
          </p>
          <button
            onClick={() => router.push('/guardian/add')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Guardian
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {guardians.map((g) => {
            const status = getStatusDisplay(g.status)
            return (
              <div
                key={g.id}
                className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <User className="h-6 w-6 text-gray-800" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{g.guardian_name}</span>
                      {g.emergency_contact && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <Star className="h-3 w-3 mr-1" /> Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-800 text-sm">{getRelationshipLabel(g.relationship_type)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center md:space-x-6">
                  <div className="flex flex-col space-y-1 text-sm text-gray-800 mb-2 md:mb-0">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" /> {g.guardian_email}
                    </span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" /> {g.guardian_phone}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Added: {formatDate(g.created_at)}
                    </span>
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-1" /> Last Active: {formatDate(g.last_active)}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" /> Requests: {g.requests_handled}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {g.status === 'pending' && (
                      <button
                        disabled={actionLoading === g.id}
                        onClick={() => handleResendInvitation(g.id)}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-medium hover:bg-yellow-200 flex items-center text-sm"
                      >
                        {actionLoading === g.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Mail className="h-4 w-4 mr-1" />
                        )}
                        Resend Invite
                      </button>
                    )}
                    <button
                      disabled={actionLoading === g.id}
                      onClick={() => setShowDeleteConfirm(g.id)}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-medium hover:bg-red-200 flex items-center text-sm"
                    >
                      {actionLoading === g.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === g.id && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Remove Guardian?</h2>
                      <p className="text-gray-700 mb-6">
                        Are you sure you want to remove <span className="font-bold">{g.guardian_name}</span> as your guardian?
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRemoveGuardian(g.id)}
                          disabled={actionLoading === g.id}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium flex items-center"
                        >
                          {actionLoading === g.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
