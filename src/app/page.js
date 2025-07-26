// src/app/page.js
import Link from 'next/link'
import { Shield, Heart, Clock, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
        <div className="space-x-4">
          <Link 
            href="/dashboard" 
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
          >
            Get Started
          </Link>
          <Link 
            href="/how-it-works" 
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Guardian Protection</h3>
          <p className="text-gray-600">
            Trusted friends control your unblocking decisions when you're emotionally vulnerable.
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

      {/* Stats Section */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
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
    </div>
  )
}