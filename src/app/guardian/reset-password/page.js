// src/app/guardian/reset-password/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HeartHandshake, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function GuardianResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if the user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // The user should have a session from clicking the reset link
      if (session) {
        setHasValidSession(true)
      }
      setSessionChecked(true)
    }

    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setHasValidSession(true)
        }
      }
    )

    checkSession()

    return () => subscription.unsubscribe()
  }, [])

  const validateForm = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
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
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      
      // Sign out after password reset so they can log in fresh
      await supabase.auth.signOut()
      
      // Redirect to guardian login after a short delay
      setTimeout(() => {
        router.push('/guardian/login')
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Still checking session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  // Invalid or expired link
  if (!hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <HeartHandshake className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Guardian</h1>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Invalid or Expired Link</h2>
            <p className="text-yellow-700 text-sm mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <Link 
              href="/guardian/forgot-password" 
              className="block w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Request New Reset Link
            </Link>
            <Link 
              href="/guardian/login" 
              className="inline-flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <HeartHandshake className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Guardian</h1>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">Password Reset Successful!</h2>
            <p className="text-green-700 text-sm mb-4">
              Your password has been updated. You&apos;ll be redirected to sign in shortly.
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-green-600 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <HeartHandshake className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Guardian</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter new password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}