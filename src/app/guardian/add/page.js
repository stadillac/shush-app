// src/app/guardian/add/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Shield, ArrowLeft, CheckCircle, Loader2, Mail, User, MessageSquare, AlertTriangle } from 'lucide-react'
import { supabase, addGuardian, hasActiveGuardian } from '@/lib/supabase'

export default function AddGuardianPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
    personalMessage: '',
    agreeToTerms: false
  })

  const relationshipOptions = [
    { value: 'friend', label: 'Friend' },
    { value: 'family', label: 'Family Member' },
    { value: 'partner', label: 'Partner/Spouse' },
    { value: 'therapist', label: 'Therapist/Counselor' },
    { value: 'mentor', label: 'Mentor/Coach' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/auth/login')
          return
        }
        setUser(user)

        // Check if user already has a Guardian
        const hasGuardian = await hasActiveGuardian(user.id)
        if (hasGuardian) {
          router.push('/dashboard')
          return
        }
      } catch (err) {
        console.error('Auth check error:', err)
        router.push('/auth/login')
      } finally {
        setPageLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return formData.name.trim() && 
               formData.email.trim() && 
               emailRegex.test(formData.email) &&
               formData.relationship
      case 2:
        return formData.personalMessage.trim().length >= 20 && formData.agreeToTerms
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      setError('')
    } else {
      if (step === 1) {
        setError('Please fill in all fields with a valid email address.')
      } else {
        setError('Please complete your personal message (minimum 20 characters) and agree to the terms.')
      }
    }
  }

  // Send guardian invitation email
  const sendInvitationEmail = async () => {
    try {
      const response = await fetch('/api/email/guardian-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianEmail: formData.email.trim(),
          personalMessage: formData.personalMessage.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setEmailSent(true)
        return true
      } else {
        setEmailError(result.error || 'Failed to send invitation email')
        return false
      }
    } catch (err) {
      console.error('Error sending invitation email:', err)
      setEmailError('Failed to send invitation email. Your guardian can still be notified manually.')
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2) || !user) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')
    setEmailError('')

    try {
      // Add guardian to database
      await addGuardian(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        relationship: formData.relationship,
        personalMessage: formData.personalMessage.trim()
      })
      
      // Send invitation email (don't block on failure)
      await sendInvitationEmail()
      
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to add Guardian. Please try again.')
      console.error('Add Guardian error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Guardian Added Successfully!</h1>
          <p className="text-gray-800 mb-8 text-lg">
            {formData.name} has been added as your Guardian.
          </p>
          
          {/* Email Status */}
          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-900">Invitation Email Sent!</h3>
              </div>
              <p className="text-green-800 text-sm">
                {formData.name} will receive an email at {formData.email} explaining their Guardian role
                and how to access their dashboard.
              </p>
            </div>
          ) : emailError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-900">Email Not Sent</h3>
              </div>
              <p className="text-yellow-800 text-sm mb-3">{emailError}</p>
              <p className="text-yellow-700 text-sm">
                You may want to personally let {formData.name} know they&apos;ve been added as your Guardian.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <div className="text-blue-800 text-sm space-y-2">
                <p>• {formData.name} will receive an email explaining their Guardian role</p>
                <p>• They&apos;ll get instructions on how to respond to your unblock requests</p>
                <p>• You can now start blocking contacts with Guardian protection</p>
              </div>
            </div>
          )}

          <div className="space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => router.push('/block')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200"
            >
              Block First Contact
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
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <Heart className="h-8 w-8 text-red-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Your Guardian</h1>
            <p className="text-gray-800">Step {step} of 2</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-red-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Who will be your Guardian?</h2>
            <p className="text-gray-800 mb-6">
              Choose someone you trust to help you make thoughtful decisions about unblocking contacts.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Guardian&apos;s Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter their name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Guardian&apos;s Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="guardian@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              They&apos;ll receive an email invitation explaining their role
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship *
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select relationship type</option>
              {relationshipOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Shield className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">What makes a good Guardian?</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Someone who has your best interests at heart</li>
                  <li>• Someone who can be objective when you&apos;re emotional</li>
                  <li>• Someone who will be honest, even when it&apos;s hard</li>
                  <li>• Someone who responds to messages in a timely manner</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!validateStep(1)}
            className={`w-full py-3 rounded-lg font-medium ${
              validateStep(1)
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Personal Message */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Write a personal message</h2>
            <p className="text-gray-800 mb-6">
              This message will be included in the invitation email to {formData.name}.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              Your Message to {formData.name} *
            </label>
            <textarea
              name="personalMessage"
              value={formData.personalMessage}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="I've chosen you as my Guardian because I trust your judgment and care about my wellbeing. This means you'll help me make thoughtful decisions about unblocking contacts when I'm feeling emotionally vulnerable..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.personalMessage.length}/500 characters (minimum 20)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Guardian Responsibilities</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your Guardian will receive unblock requests via email with context about your situation. 
                  They can approve, deny, or suggest alternatives. They&apos;re not responsible for your actions, 
                  but they&apos;re committing to help you make thoughtful decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 mr-3"
              />
              <span className="text-sm text-gray-700">
                I understand that my Guardian is volunteering to help me and is not responsible for my decisions. 
                I can change or remove my Guardian at any time. I consent to sharing my unblock request details 
                with my Guardian for the purpose of accountability and support.
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !validateStep(2)}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Adding Guardian...
              </>
            ) : (
              'Add Guardian & Send Invitation'
            )}
          </button>
        </div>
      )}
    </div>
  )
}