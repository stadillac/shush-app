// src/app/guardian/[email]/page.js
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, Shield, Loader2, AlertTriangle, Mail, Lock, Eye, EyeOff } from 'lucide-react'

// This would be replaced with your actual supabase functions
const verifyGuardianAccess = async (email, accessCode) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Mock verification - in real app, check if guardian exists and code is valid
  return {
    isValid: accessCode === '123456' || accessCode === 'guardian',
    guardianInfo: {
      email: email,
      name: 'Guardian User',
      totalUsers: 2
    }
  }
}

export default function GuardianAccessPage() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCode, setShowCode] = useState(false)
  const params = useParams()
  const router = useRouter()

  const guardianEmail = decodeURIComponent(params.email || '')

  useEffect(() => {
    // Validate email format
    if (!guardianEmail || !isValidEmail(guardianEmail)) {
      setError('Invalid guardian email in URL')
    }
  }, [guardianEmail])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!accessCode.trim()) {
      setError('Please enter your access code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await verifyGuardianAccess(guardianEmail, accessCode.trim())
      
      if (result.isValid) {
        // Redirect to guardian dashboard with email parameter
        router.push(`/guardian-dashboard?email=${encodeURIComponent(guardianEmail)}`)
      } else {
        setError('Invalid access code. Please check your email for the correct code.')
      }
    } catch (err) {
      setError('Failed to verify access code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  if (!guardianEmail || !isValidEmail(guardianEmail)) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Access Link</h1>
          <p className="text-gray-600 mb-6">
            This guardian access link appears to be invalid or malformed. 
            Please check the link in your email and try again.
          </p>
          <a 
            href="mailto:support@shush.app"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 inline-block"
          >
            Contact Support
          </a>
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
            <Heart className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Guardian Access</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome, Guardian</h2>
          <p className="text-gray-600">
            Enter your access code to review unblock requests
          </p>
        </div>

        {/* Guardian Email Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-blue-800 text-sm font-medium">Guardian Account</p>
              <p className="text-blue-700 text-sm">{guardianEmail}</p>
            </div>
          </div>
        </div>

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="accessCode"
                name="accessCode"
                type={showCode ? 'text' : 'password'}
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="pl-10 pr-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your 6-digit code"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Check your email for the 6-digit access code sent when someone requested your help as a Guardian.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Access Guardian Dashboard'
            )}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-8 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">New to being a Guardian?</h3>
            <p className="text-xs text-gray-600 mb-3">
              Learn about your role and responsibilities in helping someone maintain healthy digital boundaries.
            </p>
            <a 
              href="/guardian-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Shield className="h-4 w-4 mr-1" />
              Read Guardian Guide
            </a>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Having trouble accessing your account?{' '}
              <a href="mailto:guardians@shush.app" className="text-red-600 hover:text-red-500">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Demo Access */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo Access</h3>
          <p className="text-xs text-yellow-700 mb-2">
            For demonstration purposes, use code: <code className="bg-yellow-200 px-1 rounded">guardian</code>
          </p>
          <p className="text-xs text-yellow-600">
            In production, guardians receive secure codes via email.
          </p>
        </div>
      </div>
    </div>
  )
}