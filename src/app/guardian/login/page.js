// src/app/guardian/login/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HeartHandshake, Mail, Lock, Loader2 } from 'lucide-react'
import { signInGuardian } from '../../../lib/supabase'

export default function GuardianLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signInGuardian(email.trim(), password)

      if (result.success) {
        // Redirect to guardian dashboard
        router.push('/guardian-dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      console.error('Guardian login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <HeartHandshake className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Guardian Sign In</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back, Guardian</h2>
          <p className="text-gray-600">
            Sign in to your Guardian account to help others
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your Guardian email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/guardian/forgot-password" className="font-medium text-red-600 hover:text-red-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In to Guardian Dashboard'
              )}
            </button>
          </div>
        </form>

        {/* Create Account Link */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">New to being a Guardian?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/guardian/signup" 
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
            >
              Create Guardian Account
            </Link>
          </div>
        </div>

        {/* Learn More */}
        <div className="mt-8 text-center">
          <Link 
            href="/guardian-guide"
            className="text-red-600 hover:text-red-500 text-sm font-medium"
          >
            Learn about being a Guardian →
          </Link>
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <Link href="mailto:guardians@shush.app" className="text-red-600 hover:text-red-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}