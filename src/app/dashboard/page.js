// src/app/dashboard/page.js
'use client'
import { useState } from 'react'
import { Shield, Users, Heart, AlertTriangle, CheckCircle, Plus } from 'lucide-react'

export default function Dashboard() {
  const [blockedContacts] = useState([
    { 
      id: 1, 
      name: 'Alex Johnson', 
      reason: 'Toxic ex-relationship', 
      platforms: ['Instagram', 'Text Messages'], 
      blockedDate: '2024-01-15',
      daysSince: 7
    },
    { 
      id: 2, 
      name: 'Mike Thompson', 
      reason: 'Drug dealer contact', 
      platforms: ['Text Messages', 'Snapchat'], 
      blockedDate: '2024-02-03',
      daysSince: 3
    }
  ])

  const [guardian] = useState({
    name: 'Sarah Mitchell',
    relationship: 'Best Friend',
    phone: '+1 (555) 123-4567'
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your digital boundaries</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-medium">Shush</span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
          <div>
            <h3 className="text-xl font-semibold text-green-800">7 Days Impulse-Free!</h3>
            <p className="text-green-700">{"You're building healthy digital habits. Keep it up!"}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center">
                <Shield className="h-5 w-5 mr-2" />
                Block Someone New
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                View Blocked Contacts ({blockedContacts.length})
              </button>
            </div>
          </div>

          {/* Blocked Contacts Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Blocks</h2>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {blockedContacts.slice(0, 2).map((contact) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{contact.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {contact.daysSince} days ago
                      </p>
                    </div>
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors">
                      Request Unblock
                    </button>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    {contact.platforms.map((platform, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guardian Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Your Guardian
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800">{guardian.name}</h3>
              <p className="text-green-700 text-sm">{guardian.relationship}</p>
              <p className="text-green-600 text-xs mt-1">{guardian.phone}</p>
            </div>
            <button className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              Change Guardian
            </button>
          </div>

          {/* Crisis Resources */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Need Help?
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                Crisis Text Line
              </button>
              <button className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                Support Resources
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Impulse-free streak</span>
                  <span className="font-medium">7 days</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Total contacts blocked</span>
                  <span className="font-medium">{blockedContacts.length}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Guardian responses</span>
                  <span className="font-medium">2/2 helpful</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}