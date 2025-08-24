// src/app/guardian-dashboard/page.js
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Heart, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  User,
  Calendar,
  Phone,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Brain,
  History,
  HelpCircle,
  UserCheck,
  Star,
  TrendingUp
} from 'lucide-react'

// Mock functions - you'll need to implement these in your supabase.js
const getGuardianRequests = async (guardianEmail) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: '1',
      user_name: 'Sarah M.',
      user_email: 'sarah.m@example.com',
      contact_name: 'Alex Johnson',
      contact_relationship: 'Ex-partner/romantic',
      blocked_reason: 'Trying to get back together constantly, making it hard for me to move on. Every time we talk, I end up confused and upset for days.',
      platforms: ['SMS', 'Instagram', 'WhatsApp'],
      blocked_date: '2024-01-15',
      request_date: '2024-01-22',
      current_mood: 'lonely',
      journal_entry: 'I miss talking to them and keep wondering if they\'ve changed. I feel really lonely today and just want to reach out. But I also remember how confused and hurt I felt last time.',
      additional_context: 'Had a rough day at work and feeling isolated.',
      urgency: 'normal',
      status: 'pending',
      severity: 'high'
    },
    {
      id: '2',
      user_name: 'Mike R.',
      user_email: 'mike.r@example.com',
      contact_name: 'Jessica',
      contact_relationship: 'Former friend',
      blocked_reason: 'Toxic friendship that was affecting my mental health. They were manipulative and always made me feel guilty.',
      platforms: ['Facebook', 'SMS'],
      blocked_date: '2024-01-10',
      request_date: '2024-01-21',
      current_mood: 'calm',
      journal_entry: 'I\'ve been thinking about Jessica and wondering if I was too harsh. Maybe I should give them another chance to explain their side.',
      additional_context: 'Saw them at a mutual friend\'s party and they seemed different.',
      urgency: 'low',
      status: 'pending',
      severity: 'medium'
    },
    {
      id: '3',
      user_name: 'Sarah M.',
      user_email: 'sarah.m@example.com',
      contact_name: 'Mom',
      contact_relationship: 'Family member',
      blocked_reason: 'Constant guilt tripping and emotional manipulation during my recovery.',
      platforms: ['SMS', 'Email', 'Phone'],
      blocked_date: '2024-01-08',
      request_date: '2024-01-20',
      current_mood: 'anxious',
      journal_entry: 'It\'s been two weeks since I blocked Mom and I feel terrible about it. But she was making my anxiety so much worse with constant criticism about my therapy.',
      additional_context: 'My birthday is coming up and I feel guilty.',
      urgency: 'high',
      status: 'approved',
      guardian_response: 'I think you should wait a bit longer and maybe write her a letter first explaining your boundaries.',
      response_date: '2024-01-20',
      severity: 'high'
    },
    {
      id: '4',
      user_name: 'Mike R.',
      user_email: 'mike.r@example.com',
      contact_name: 'Tom',
      contact_relationship: 'Coworker/professional',
      blocked_reason: 'Inappropriate messages and making work uncomfortable.',
      platforms: ['WhatsApp', 'Instagram'],
      blocked_date: '2024-01-18',
      request_date: '2024-01-19',
      current_mood: 'confused',
      journal_entry: 'Tom apologized and said he was just being friendly. Maybe I misunderstood his intentions?',
      additional_context: 'HR got involved and he seemed genuinely sorry.',
      urgency: 'normal',
      status: 'denied',
      guardian_response: 'Trust your instincts. Workplace boundaries are important and you had valid reasons to block him.',
      response_date: '2024-01-19',
      severity: 'medium'
    }
  ]
}

const respondToRequest = async (requestId, response, message) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true }
}

const getGuardianStats = async (guardianEmail) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    totalUsers: 2,
    totalRequests: 15,
    approvedRequests: 7,
    deniedRequests: 4,
    pendingRequests: 4,
    averageResponseTime: '4 hours',
    streak: 12 // days as active guardian
  }
}

// Component to handle search params with Suspense
function GuardianDashboardContent() {
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending') // pending, all, approved, denied
  const [showRequestDetails, setShowRequestDetails] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get guardian email from URL params or localStorage
  const guardianEmail = searchParams.get('email') || 'guardian@example.com'

  useEffect(() => {
    loadDashboardData()
  }, [guardianEmail])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [requestsData, statsData] = await Promise.all([
        getGuardianRequests(guardianEmail),
        getGuardianStats(guardianEmail)
      ])
      
      setRequests(requestsData)
      setStats(statsData)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (requestId, response) => {
    try {
      setActionLoading(requestId)
      await respondToRequest(requestId, response, responseMessage)
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: response,
              guardian_response: responseMessage,
              response_date: new Date().toISOString()
            }
          : req
      ))
      
      setShowRequestDetails(null)
      setResponseMessage('')
    } catch (err) {
      setError('Failed to respond to request')
    } finally {
      setActionLoading(null)
    }
  }

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      calm: '😌',
      sad: '😢',
      anxious: '😰',
      angry: '😠',
      lonely: '😔',
      hopeful: '🙂',
      confused: '😕',
      determined: '😤'
    }
    return moodEmojis[mood] || '😐'
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center">
          <Heart className="h-10 w-10 text-red-500 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guardian Dashboard</h1>
            <p className="text-gray-600">
              Helping your loved ones make thoughtful decisions
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Signed in as: {guardianEmail}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.open('/guardian-guide', '_blank')}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Guardian Guide
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">People You Help</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Guardian Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
              { key: 'denied', label: 'Denied', count: requests.filter(r => r.status === 'denied').length },
              { key: 'all', label: 'All Requests', count: requests.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} requests
            </h3>
            <p className="text-gray-500">
              {filter === 'pending' 
                ? "You\'re all caught up! No pending requests need your attention."
                : `No ${filter} requests to display.`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Request Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{request.user_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getMoodEmoji(request.current_mood)}</span>
                      <span className="text-sm text-gray-600 capitalize">{request.current_mood}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency} priority
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Wants to unblock: </span>
                      <span className="text-sm text-gray-900">{request.contact_name}</span>
                      <span className="text-xs text-gray-500 ml-2">({request.contact_relationship})</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Originally blocked: </span>
                      <span className="text-sm text-gray-600">{new Date(request.blocked_date).toLocaleDateString()}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getSeverityColor(request.severity)}`}>
                        {request.severity} risk
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Platforms: </span>
                      <span className="text-sm text-gray-600">{request.platforms.join(', ')}</span>
                    </div>
                  </div>

                  {/* Request Details Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Why they blocked originally:</span>
                    </p>
                    <p className="text-sm text-gray-800 mb-3">
                      "{request.blocked_reason}"
                    </p>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Current thoughts:</span>
                    </p>
                    <p className="text-sm text-gray-800">
                      "{request.journal_entry.length > 150 
                        ? request.journal_entry.substring(0, 150) + '...'
                        : request.journal_entry}"
                    </p>
                  </div>

                  {/* Status Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Requested {new Date(request.request_date).toLocaleDateString()}
                    </div>
                    
                    {request.status !== 'pending' && (
                      <div className="flex items-center text-sm">
                        {request.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="capitalize text-gray-600">{request.status}</span>
                        <span className="text-gray-400 ml-2">
                          {new Date(request.response_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Guardian Response */}
                  {request.guardian_response && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">Your Response:</p>
                      <p className="text-sm text-blue-700">"{request.guardian_response}"</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-fit">
                  <button
                    onClick={() => setShowRequestDetails(request.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleResponse(request.id, 'approved')}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, 'denied')}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Deny
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Details Modal */}
      {showRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const request = requests.find(r => r.id === showRequestDetails)
              if (!request) return null
              
              return (
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                    <button
                      onClick={() => setShowRequestDetails(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Request Overview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">User:</span>
                        <p className="text-gray-900">{request.user_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <p className="text-gray-900">{request.contact_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Relationship:</span>
                        <p className="text-gray-900">{request.contact_relationship}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Current Mood:</span>
                        <p className="text-gray-900">
                          {getMoodEmoji(request.current_mood)} {request.current_mood}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Full Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Why was this contact originally blocked?</h3>
                      <p className="text-gray-700 bg-red-50 p-4 rounded-lg">
                        \"{request.blocked_reason}\"
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Current thoughts and feelings:</h3>
                      <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                        \"{request.journal_entry}\"
                      </p>
                    </div>

                    {request.additional_context && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Additional context:</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          \"{request.additional_context}\"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Risk Level</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(request.severity)}`}>
                          {request.severity} risk
                        </span>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium text-orange-800 mb-2">Priority</h4>
                        <span className={`px-3 py-1 rounded-full text-sm ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency} priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Response Section */}
                  {request.status === 'pending' && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Your Response</h3>
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Explain your decision to help them understand your reasoning..."
                      />
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          onClick={() => handleResponse(request.id, 'denied')}
                          disabled={actionLoading === request.id}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mr-2" />
                          )}
                          Deny Request
                        </button>
                        <button
                          onClick={() => handleResponse(request.id, 'approved')}
                          disabled={actionLoading === request.id}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-2" />
                          )}
                          Approve Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Response Display */}
                  {request.guardian_response && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Your Previous Response:</h3>
                      <p className="text-blue-800">\"{request.guardian_response}\"</p>
                      <p className="text-blue-600 text-sm mt-2">
                        Responded on {new Date(request.response_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// Loading component for Suspense fallback
function GuardianDashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  )
}

// Main export with Suspense boundary
export default function GuardianDashboard() {
  return (
    <Suspense fallback={<GuardianDashboardLoading />}>
      <GuardianDashboardContent />
    </Suspense>
  )
}