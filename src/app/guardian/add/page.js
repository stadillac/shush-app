// src/app/guardian/add/page.js
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Mail, User, Users } from 'lucide-react'
import { addGuardian } from '../../../lib/supabase'
import { supabase } from '../../../lib/supabase'

export default function AddGuardianPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
    personalMessage: '',
    agreeToTerms: false
  })

  const relationshipTypes = [
    { value: 'friend', label: 'Close Friend', description: 'Someone you trust deeply with personal matters' },
    { value: 'family', label: 'Family Member', description: 'Parent, sibling, or close relative' },
    { value: 'partner', label: 'Romantic Partner', description: 'Current romantic partner or spouse' },
    { value: 'mentor', label: 'Mentor/Counselor', description: 'Therapist, coach, or trusted advisor' },
    { value: 'sponsor', label: 'Recovery Sponsor', description: 'AA/NA sponsor or recovery support person' },
    { value: 'other', label: 'Other', description: 'Another trusted person in your life' }
  ]

  // Check authentication on component mount
  useState(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
    }
    checkUser()
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
        return formData.name.trim() && formData.email.trim() && formData.relationship
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
        setError('Please fill in all required fields.')
      } else {
        setError('Please complete your personal message (minimum 20 characters) and agree to the terms.')
      }
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2) || !user) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await addGuardian(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        relationship: formData.relationship,
        personalMessage: formData.personalMessage.trim()
      })
      
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to add Guardian. Please try again.')
      console.error('Add Guardian error:', err)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Guardian Added Successfully!</h1>
          <p className="text-gray-800 mb-8 text-lg">
            {formData.name} has been added as your Guardian. {"They'll receive an email explaining their role."}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>• {formData.name} will receive an email explaining their Guardian role</p>
              <p>• {"They'll get instructions on how to respond to your unblock requests"}</p>
              <p>• You can now start blocking contacts with Guardian protection</p>
            </div>
          </div>

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
            <h1 className="text-2xl font-bold text-gray-900">Add Guardian</h1>
            <p className="text-gray-800">Step {step} of 2</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                stepNum <= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                {stepNum}
              </div>
              {stepNum < 2 && (
                <div className={`flex-1 h-1 mx-2 ${
                  stepNum < step ? 'bg-red-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Guardian Info</span>
          <span>Confirm & Send</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Guardian Information */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Who is your Guardian?</h2>
            <p className="text-gray-800 mb-6">
              {"Choose someone you trust completely. They'll help you make healthy decisions about unblocking contacts when you're emotionally vulnerable."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {"Guardian's Full Name *"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter their full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {"Guardian's Email Address *"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="guardian@example.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {"They'll receive an email explaining their Guardian role"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type *
            </label>
            <div className="space-y-3">
              {relationshipTypes.map(type => (
                <div
                  key={type.value}
                  onClick={() => setFormData(prev => ({ ...prev, relationship: type.value }))}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.relationship === type.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${
                        formData.relationship === type.value ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </h3>
                      <p className={`text-sm ${
                        formData.relationship === type.value ? 'text-red-700' : 'text-gray-800'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      formData.relationship === type.value
                        ? 'bg-red-600 border-red-600'
                        : 'border-gray-300'
                    }`}>
                      {formData.relationship === type.value && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
          >
            Continue to Message
          </button>
        </div>
      )}

      {/* Step 2: Personal Message & Terms */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Message to {formData.name}</h2>
            <p className="text-gray-800 mb-6">
              Write a personal message explaining why you chose them and what this role means to you. This will be included in their Guardian invitation email.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message *
            </label>
            <textarea
              name="personalMessage"
              value={formData.personalMessage}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Hi [Name], I'm using an app called Shush to help me maintain healthier digital boundaries. I've chosen you as my Guardian because I trust your judgment and care about my wellbeing. This means you'll help me make thoughtful decisions about unblocking contacts when I'm feeling emotionally vulnerable..."
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
                  {"They can approve, deny, or suggest alternatives. They're not responsible for your actions, "}
                  {"but they're committing to help you make thoughtful decisions."}
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