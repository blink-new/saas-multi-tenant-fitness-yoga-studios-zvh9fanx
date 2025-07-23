import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">ZenFlow Control</h2>
        <p className="text-gray-600">Loading your studio dashboard...</p>
      </div>
    </div>
  )
}