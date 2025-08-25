// src/app/guardian/signup/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HeartHandshake, Mail, Lock, User, Loader2, CheckCircle, Shield } from 'lucide-react'
import { createGuardianAccount } from '../../../lib/supabase'

export default function GuardianSignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.agreeToTerms) {
      setError('Please agree to the Guardian Terms of Service')
      return false
    }
    return true
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const result = await createGuardianAccount({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      })
      
      if (result.success) {
        setSuccess(true)
        // Auto-redirect to dashboard after success message
        setTimeout(() => {
          router.push('/guardian-dashboard')
        }, 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to create Guardian account. Please try again.')
      console.error('Guardian signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, Guardian!</h1>
          <p className="text-gray-600 mb-8">
            Your Guardian account has been created successfully. You can now help others maintain healthy digital boundaries.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-red-900 mb-2">What&apos;s Next?</h3>
            <div className="text-red-800 text-sm space-y-2">
              <p>• People can now add you as their Guardian using your email</p>
              <p>• You&apos;ll receive notifications when someone needs your help</p>
              <p>• Check your dashboard regularly for unblock requests</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => router.push('/guardian-dashboard')}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700"
            >
              Go to Guardian Dashboard
            </button>
            <Link 
              href="/guardian-guide"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200"
            >
              Read Guardian Guide
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <HeartHandshake className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Create Guardian Account</h1>
          </div>
          <p className="text-gray-600">
            Join as a Guardian and help others maintain healthy digital boundaries
          </p>
        </div>

        {/* What is a Guardian Info */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-3">
            <Shield className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-900">What is a Guardian?</h3>
          </div>
          <p className="text-red-800 text-sm">
            A Guardian helps people make thoughtful decisions about unblocking contacts when they&apos;re emotionally vulnerable. You&apos;ll review requests and provide guidance based on what&apos;s best for their wellbeing.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="guardian@example.com"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              People will use this email to add you as their Guardian
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Create a secure password"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/guardian/terms" className="text-red-600 hover:text-red-500 font-medium">
                Guardian Terms of Service
              </Link>
              {' '}and understand my responsibilities as a Guardian *
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Create Guardian Account'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have a Guardian account?{' '}
            <Link href="/guardian/login" className="font-medium text-red-600 hover:text-red-500">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Learn More */}
        <div className="mt-8 text-center">
          <Link 
            href="/guardian-guide"
            className="text-red-600 hover:text-red-500 text-sm font-medium"
          >
            Learn more about being a Guardian →
          </Link>
        </div>
      </div>
    </div>
  )
}
