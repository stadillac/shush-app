// src/app/page.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, Heart, Clock, Users, ArrowRight, CheckCircle, UserPlus, HeartHandshake } from 'lucide-react'

export default function HomePage() {
  const [selectedPath, setSelectedPath] = useState(null) // 'user' or 'guardian'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-indigo-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Shush</h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Break harmful communication cycles with Guardian-controlled blocking. 
          Take back control of your digital boundaries.
        </p>
        
        {/* Path Selection */}
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How do you want to help?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* User Path */}
            <div 
              className={`relative bg-white rounded-xl p-8 border-2 transition-all cursor-pointer ${
                selectedPath === 'user' 
                  ? 'border-indigo-500 shadow-lg transform scale-105' 
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedPath('user')}
            >
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">I need help managing my boundaries</h3>
                <p className="text-gray-600 mb-6">
                  Block harmful contacts and get accountability from trusted guardians when you want to reconnect.
                </p>
                
                <div className="space-y-2 text-sm text-gray-700 mb-6">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Block contacts across multiple platforms</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Add trusted guardians for accountability</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Get support during vulnerable moments</span>
                  </div>
                </div>

                {selectedPath === 'user' && (
                  <div className="space-y-3">
                    <Link 
                      href="/auth/signup" 
                      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                    >
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link 
                      href="/auth/login" 
                      className="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
              
              {selectedPath === 'user' && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Guardian Path */}
            <div 
              className={`relative bg-white rounded-xl p-8 border-2 transition-all cursor-pointer ${
                selectedPath === 'guardian' 
                  ? 'border-red-500 shadow-lg transform scale-105' 
                  : 'border-gray-200 hover:border-red-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedPath('guardian')}
            >
              <div className="text-center">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">I want to help someone as a Guardian</h3>
                <p className="text-gray-600 mb-6">
                  Support someone you care about by providing accountability and guidance for their digital boundaries.
                </p>
                
                <div className="space-y-2 text-sm text-gray-700 mb-6">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Review unblock requests thoughtfully</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Provide objective perspective</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Help them make healthy decisions</span>
                  </div>
                </div>

                {selectedPath === 'guardian' && (
                  <div className="space-y-3">
                    <Link 
                      href="/guardian/signup" 
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center"
                    >
                      Create Guardian Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link 
                      href="/guardian/login" 
                      className="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
                    >
                      Guardian Sign In
                    </Link>
                    <div className="text-center pt-2">
                      <Link 
                        href="/guardian-guide" 
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Learn About Being a Guardian →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedPath === 'guardian' && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Default CTA when no path selected */}
        {!selectedPath && (
          <div className="space-x-4">
            <button
              onClick={() => setSelectedPath('user')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              I Need Help With Boundaries
            </button>
            <button
              onClick={() => setSelectedPath('guardian')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              I Want to Be a Guardian
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Guardian Protection</h3>
          <p className="text-gray-600">
            Trusted friends control your unblocking decisions when you&apos;re emotionally vulnerable.
          </p>
        </div>
        <div className="text-center p-6">
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Cooling-Off Periods</h3>
          <p className="text-gray-600">
            Mandatory waiting periods with reflection exercises before Guardian contact.
          </p>
        </div>
        <div className="text-center p-6">
          <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Multi-Platform Blocking</h3>
          <p className="text-gray-600">
            Block contacts across social media, SMS, and email from one unified dashboard.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How Shush Works</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Users */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">For People Seeking Help</h3>
            </div>
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">1</div>
                <p className="text-gray-700">Add a trusted Guardian who cares about your wellbeing</p>
              </div>
              <div className="flex">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">2</div>
                <p className="text-gray-700">Block harmful contacts across multiple platforms</p>
              </div>
              <div className="flex">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">3</div>
                <p className="text-gray-700">When you want to unblock, request your Guardian&apos;s approval</p>
              </div>
              <div className="flex">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">4</div>
                <p className="text-gray-700">Build healthier relationship patterns with support</p>
              </div>
            </div>
          </div>

          {/* For Guardians */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <HeartHandshake className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">For Guardians</h3>
            </div>
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">1</div>
                <p className="text-gray-700">Receive invitation from someone who trusts you</p>
              </div>
              <div className="flex">
                <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">2</div>
                <p className="text-gray-700">Get notified when they want to unblock someone</p>
              </div>
              <div className="flex">
                <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">3</div>
                <p className="text-gray-700">Review context and their emotional state</p>
              </div>
              <div className="flex">
                <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">4</div>
                <p className="text-gray-700">Approve, deny, or suggest alternatives with explanation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg p-8 shadow-sm mb-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">73%</div>
            <p className="text-gray-600">of adults send messages they later regret</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">1 in 4</div>
            <p className="text-gray-600">people contact harmful individuals despite knowing consequences</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
            <p className="text-gray-600">existing solutions provide genuine accountability</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center bg-gradient-to-r from-indigo-600 to-red-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to build healthier digital boundaries?</h2>
        <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
          Join thousands of people who are taking control of their digital relationships with the support of trusted guardians.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => setSelectedPath('user')}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Protecting Yourself
          </button>
          <button
            onClick={() => setSelectedPath('guardian')}
            className="bg-red-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-400 transition-colors"
          >
            Create Guardian Account
          </button>
        </div>
      </div>
    </div>
  )
}