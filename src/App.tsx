import React, { useState, useEffect } from 'react'
import { blink } from './blink/client'
import Dashboard from './components/Dashboard'
import LoadingScreen from './components/LoadingScreen'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ZenFlow Control</h1>
          <p className="text-gray-600 mb-8">Please sign in to access your studio dashboard</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}

export default App