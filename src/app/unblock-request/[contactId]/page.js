// src/app/unblock-request/[contactId]/page.js
'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Shield, Heart, ArrowLeft, Loader2, Clock, AlertTriangle, CheckCircle, Send, Brain, Pause } from 'lucide-react'
import { supabase, getBlockedContact, getUserGuardian, createUnblockRequest, hasActiveGuardian } from '../../../lib/supabase'

export default function UnblockRequestPage() {
  const [step, setStep] = useState(1) // 1: Cooling off, 2: Reflection, 3: Request, 4: Success
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [contact, setContact] = useState(null)
  const [guardian, setGuardian] = useState(null)
  const [coolingOffComplete, setCoolingOffComplete] = useState(false)
  const [coolingOffTime, setCoolingOffTime] = useState(300) // 5 minutes in seconds
  const router = useRouter()
  const params = useParams()
  const contactId = params.contactId

  const [requestData, setRequestData] = useState({
    mood: '',
    journalEntry: '',
    additionalContext: '',
    urgency: 'normal'
  })

  const moodOptions = [
    { value: 'calm', label: 'Calm', emoji: '😌', description: 'Feeling peaceful and centered' },
    { value: 'sad', label: 'Sad', emoji: '😢', description: 'Feeling down or melancholy' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', description: 'Feeling worried or stressed' },
    { value: 'angry', label: 'Angry', emoji: '😠', description: 'Feeling frustrated or upset' },
    { value: 'lonely', label: 'Lonely', emoji: '😔', description: 'Feeling isolated or disconnected' },
    { value: 'hopeful', label: 'Hopeful', emoji: '🙂', description: 'Feeling optimistic about the future' },
    { value: 'confused', label: 'Confused', emoji: '😕', description: 'Feeling uncertain or unclear' },
    { value: 'determined', label: 'Determined', emoji: '😤', description: 'Feeling focused and resolved' }
  ]

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', description: 'Can wait a few days', color: 'bg-green-100 text-green-800' },
    { value: 'normal', label: 'Normal', description: 'Would like a response today', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High Priority', description: 'Need response within hours', color: 'bg-orange-100 text-orange-800' },
    { value: 'emergency', label: 'Emergency', description: 'Urgent safety or health concern', color: 'bg-red-100 text-red-800' }
  ]

  // Load contact and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }
        setUser(user)

        // Load contact data
        const contactData = await getBlockedContact(user.id, contactId)
        if (!contactData) {
          setError('Contact not found or already unblocked')
          return
        }
        setContact(contactData)

        // Load guardian data
        const guardianData = await getUserGuardian(user.id)
        if (!guardianData) {
          setError('No active Guardian found')
          return
        }
        setGuardian(guardianData)

        // Check if there's already a pending request
        const { data: existingRequest } = await supabase
          .from('unblock_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('blocked_contact_id', contactId)
          .eq('status', 'pending')
          .single()

        if (existingRequest) {
          setError('You already have a pending unblock request for this contact')
          return
        }

        // Set cooling off time based on contact severity
        const baseTime = 300 // 5 minutes
        const severityMultiplier = {
          'low': 1,
          'medium': 2,
          'high': 3
        }
        const multiplier = severityMultiplier[contactData.severity] || 1
        setCoolingOffTime(baseTime * multiplier)

      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load page data')
      } finally {
        setPageLoading(false)
      }
    }

    if (contactId) {
      loadData()
    }
  }, [contactId, router])

  // Cooling off timer
  useEffect(() => {
    if (step === 1 && coolingOffTime > 0) {
      const timer = setInterval(() => {
        setCoolingOffTime(prev => {
          if (prev <= 1) {
            setCoolingOffComplete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step, coolingOffTime])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRequestData(prev => ({ ...prev, [name]: value }))
  }

  const handleMoodSelect = (mood) => {
    setRequestData(prev => ({ ...prev, mood }))
  }

  const handleUrgencySelect = (urgency) => {
    setRequestData(prev => ({ ...prev, urgency }))
  }

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 2:
        return requestData.mood && requestData.journalEntry.length >= 50
      case 3:
        return requestData.mood && requestData.journalEntry.length >= 50
      default:
        return true
    }
  }

  const handleNext = () => {
    if (step === 1 && !coolingOffComplete) {
      setError('Please complete the cooling-off period before continuing')
      return
    }
    
    if (validateStep(step)) {
      setStep(step + 1)
      setError('')
    } else {
      setError('Please complete all required fields before continuing')
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3) || !user || !contact) {
      setError('Please complete all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createUnblockRequest(user.id, contactId, {
        mood: requestData.mood,
        journalEntry: requestData.journalEntry,
        additionalContext: requestData.additionalContext,
        urgency: requestData.urgency
      })

      setStep(4) // Success step
    } catch (err) {
      setError(err.message || 'Failed to submit unblock request')
      console.error('Submit request error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // Error state
  if (error && !contact) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Process Request</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Sent Successfully</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Your unblock request for {contact?.contact_name} has been sent to {guardian?.guardian_name}.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>• {guardian?.guardian_name} will receive an email with your request details</p>
              <p>• They can approve, deny, or ask for more time to consider</p>
              <p>• {"You'll be notified of their decision via email and in the app"}</p>
              <p>• Check your dashboard for request status updates</p>
            </div>
          </div>

          <div className="space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Return to Dashboard
            </button>
            <button 
              onClick={() => router.push('/blocked')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200"
            >
              View All Blocked Contacts
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unblock Request</h1>
            <p className="text-gray-600">Step {step} of 3</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {contact && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{contact.contact_name}</h3>
              <p className="text-sm text-gray-600">{contact.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Blocked {new Date(contact.blocked_at).toLocaleDateString()}</p>
              <div className="flex gap-1 mt-1">
                {contact.platforms.map((platform, index) => (
                  <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                stepNum <= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  stepNum < step ? 'bg-orange-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Cooling Off</span>
          <span>Reflection</span>
          <span>Submit Request</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Cooling Off Period */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Cooling-Off Period</h2>
            <p className="text-gray-600 mb-6">
              Take a moment to reflect before requesting to unblock {contact?.contact_name}. 
              {"This pause helps ensure you're making a thoughtful decision."}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-orange-600 mb-4">
                {formatTime(coolingOffTime)}
              </div>
              {coolingOffComplete ? (
                <div className="text-green-600 font-medium">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Cooling-off period complete
                </div>
              ) : (
                <p className="text-orange-700 text-sm">
                  Please wait before proceeding. Use this time to reflect on your decision.
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              While you wait, consider these questions:
            </h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>• What specific situation is prompting this request?</p>
              <p>• How are you feeling emotionally right now?</p>
              <p>• What positive outcome are you hoping for?</p>
              <p>• Are there alternative ways to handle this situation?</p>
              <p>• Would your past self agree with unblocking this person?</p>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!coolingOffComplete}
            className={`w-full py-3 rounded-lg font-medium ${
              coolingOffComplete
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {coolingOffComplete ? 'Continue to Reflection' : 'Please Wait...'}
          </button>
        </div>
      )}

      {/* Step 2: Reflection and Mood */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">How are you feeling?</h2>
            <p className="text-gray-600 mb-6">
              Your Guardian needs to understand your emotional state to help you make the best decision.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Current Mood *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {moodOptions.map(mood => (
                <div
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    requestData.mood === mood.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{mood.emoji}</div>
                    <h3 className={`font-medium ${
                      requestData.mood === mood.value ? 'text-orange-900' : 'text-gray-900'
                    }`}>
                      {mood.label}
                    </h3>
                    <p className={`text-xs ${
                      requestData.mood === mood.value ? 'text-orange-700' : 'text-gray-600'
                    }`}>
                      {mood.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflection Journal *
            </label>
            <textarea
              name="journalEntry"
              value={requestData.journalEntry}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Why do you want to unblock this person right now? What's the situation? How do you think this will help? Be honest with yourself and your Guardian."
            />
            <p className="text-xs text-gray-500 mt-1">
              {requestData.journalEntry.length}/500 characters (minimum 50)
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={!validateStep(2)}
            className={`w-full py-3 rounded-lg font-medium ${
              validateStep(2)
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Submit Request
          </button>
        </div>
      )}

      {/* Step 3: Submit Request */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Submit Your Request</h2>
            <p className="text-gray-600 mb-6">
              Review your request before sending it to {guardian?.guardian_name}.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Priority
            </label>
            <div className="space-y-3">
              {urgencyLevels.map(level => (
                <div
                  key={level.value}
                  onClick={() => handleUrgencySelect(level.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    requestData.urgency === level.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${level.color}`}>
                        {level.label}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      requestData.urgency === level.value
                        ? 'bg-orange-600 border-orange-600'
                        : 'border-gray-300'
                    }`}>
                      {requestData.urgency === level.value && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (optional)
            </label>
            <textarea
              name="additionalContext"
              value={requestData.additionalContext}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any additional information that might help your Guardian make their decision..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-medium text-gray-900">Request Summary</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Contact:</span> {contact?.contact_name}</div>
              <div><span className="font-medium">Your Mood:</span> {moodOptions.find(m => m.value === requestData.mood)?.label} {moodOptions.find(m => m.value === requestData.mood)?.emoji}</div>
              <div><span className="font-medium">Priority:</span> {urgencyLevels.find(u => u.value === requestData.urgency)?.label}</div>
              <div><span className="font-medium">Guardian:</span> {guardian?.guardian_name}</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <Heart className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Remember</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your Guardian cares about your wellbeing. They may ask questions or suggest waiting longer. 
                  {"Trust their judgment - they're here to help you make healthy decisions."}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Send to Guardian
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}