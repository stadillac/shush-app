// src/app/block/page.js
'use client'
import React, { useState, useEffect } from 'react'
import { Shield, User, Phone, MessageSquare, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'

// Mock function - replace with your actual supabase function
const blockContact = async (userId, contactData) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  return { id: Date.now(), ...contactData }
}

export default function BlockContactPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    reason: '',
    platforms: [],
    severity: 'medium'
  })

  const platforms = [
    { id: 'sms', name: 'SMS/Text Messages', icon: MessageSquare, description: 'Block text messages and calls' },
    { id: 'instagram', name: 'Instagram', icon: User, description: 'Block on Instagram and DMs' },
    { id: 'facebook', name: 'Facebook', icon: User, description: 'Block on Facebook Messenger' },
    { id: 'twitter', name: 'Twitter/X', icon: User, description: 'Block on Twitter/X platform' },
    { id: 'tiktok', name: 'TikTok', icon: User, description: 'Block on TikTok' },
    { id: 'snapchat', name: 'Snapchat', icon: User, description: 'Block on Snapchat' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, description: 'Block on WhatsApp' },
    { id: 'email', name: 'Email', icon: MessageSquare, description: 'Filter emails to spam' }
  ]

  const relationshipTypes = [
    'Ex-partner/romantic',
    'Family member',
    'Former friend',
    'Coworker/professional',
    'Acquaintance',
    'Online contact',
    'Other'
  ]

  const severityLevels = [
    { value: 'low', label: 'Low Risk', description: 'Occasional regretful contact', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'medium', label: 'Medium Risk', description: 'Regular impulse to contact', color: 'bg-orange-100 text-orange-800' },
    { value: 'high', label: 'High Risk', description: 'Frequent harmful contact attempts', color: 'bg-red-100 text-red-800' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }))
  }

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() && formData.relationship
      case 2:
        return formData.platforms.length > 0
      case 3:
        return formData.reason.trim().length >= 20
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      setError('')
    } else {
      setError('Please complete all required fields before continuing.')
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Mock user ID - replace with actual user context
      const userId = 'mock-user-id'
      
      await blockContact(userId, formData)
      
      setSuccess(true)
    } catch (err) {
      setError('Failed to block contact. Please try again.')
      console.error('Block contact error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Successfully Blocked</h1>
          <p className="text-gray-600 mb-8 text-lg">
            {formData.name} has been blocked across {formData.platforms.length} platform{formData.platforms.length !== 1 ? 's' : ''}. 
            You can only unblock them through your Guardian.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>• Your Guardian will be notified of this new block</p>
              <p>• If you want to unblock, you'll need Guardian approval</p>
              <p>• We'll track your progress and celebrate milestones</p>
            </div>
          </div>

          <div className="space-x-4">
            <button 
              onClick={() => {
                setStep(1)
                setFormData({
                  name: '', phone: '', email: '', relationship: '',
                  reason: '', platforms: [], severity: 'medium'
                })
                setSuccess(false)
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Block Another Contact
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200"
            >
              Return to Dashboard
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
          onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Block Contact</h1>
            <p className="text-gray-600">Step {step} of 4</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                stepNum <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  stepNum < step ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Contact Info</span>
          <span>Platforms</span>
          <span>Reason</span>
          <span>Confirm</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Contact Information */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-6">Tell us about the person you want to block.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Who is this person?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="For SMS/call blocking"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="For email filtering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type *
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select relationship type</option>
              {relationshipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Continue to Platforms
          </button>
        </div>
      )}

      {/* Step 2: Platform Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Platforms to Block</h2>
            <p className="text-gray-600 mb-6">Choose where you want to block {formData.name}.</p>
          </div>

          <div className="grid gap-4">
            {platforms.map(platform => {
              const IconComponent = platform.icon
              const isSelected = formData.platforms.includes(platform.id)
              
              return (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <IconComponent className={`h-6 w-6 mr-3 ${
                      isSelected ? 'text-indigo-600' : 'text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        isSelected ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {platform.name}
                      </h3>
                      <p className={`text-sm ${
                        isSelected ? 'text-indigo-700' : 'text-gray-600'
                      }`}>
                        {platform.description}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Continue to Reason
          </button>
        </div>
      )}

      {/* Step 3: Reason and Severity */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Why are you blocking {formData.name}?</h2>
            <p className="text-gray-600 mb-6">This helps your Guardian understand the context when you request unblocking.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Level *
            </label>
            <div className="space-y-3">
              {severityLevels.map(level => (
                <div
                  key={level.value}
                  onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.severity === level.value
                      ? 'border-indigo-500 bg-indigo-50'
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
                      formData.severity === level.value
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.severity === level.value && (
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
              Detailed Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Explain why blocking this person is important for your wellbeing. This will help your Guardian make informed decisions about unblock requests."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length}/500 characters (minimum 20)
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Review and Confirm
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Confirm Block Details</h2>
            <p className="text-gray-600 mb-6">Review the information below before blocking.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Contact</h3>
              <p className="text-gray-600">{formData.name} ({formData.relationship})</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Platforms ({formData.platforms.length})</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.platforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId)
                  return (
                    <span key={platformId} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                      {platform.name}
                    </span>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Risk Level</h3>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                severityLevels.find(l => l.value === formData.severity)?.color
              }`}>
                {severityLevels.find(l => l.value === formData.severity)?.label}
              </span>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Reason</h3>
              <p className="text-gray-600 text-sm">{formData.reason}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Once blocked, only your Guardian can approve unblocking this contact. Make sure you're ready to commit to this boundary.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Blocking Contact...
              </>
            ) : (
              'Block This Contact'
            )}
          </button>
        </div>
      )}
    </div>
  )
}