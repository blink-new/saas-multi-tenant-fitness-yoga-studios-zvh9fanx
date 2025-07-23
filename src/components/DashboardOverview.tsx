import React, { useState, useEffect } from 'react'
import { Users, GraduationCap, CreditCard, TrendingUp } from 'lucide-react'
import { database } from '../lib/database'

interface Stats {
  totalClients: number
  activeTeachers: number
  monthlyRevenue: number
  recentPayments: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeTeachers: 0,
    monthlyRevenue: 0,
    recentPayments: 0
  })

  const loadStats = async () => {
    try {
      const [clients, teachers, payments] = await Promise.all([
        database.clients.list(),
        database.teachers.list(),
        database.payments.list()
      ])

      const monthlyRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
      
      setStats({
        totalClients: clients.length,
        activeTeachers: teachers.filter(t => t.status === 'active').length,
        monthlyRevenue,
        recentPayments: payments.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const statCards = [
    {
      name: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Active Teachers',
      value: stats.activeTeachers,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-indigo-500',
      change: '+18%'
    },
    {
      name: 'Recent Payments',
      value: stats.recentPayments,
      icon: TrendingUp,
      color: 'bg-amber-500',
      change: '+8%'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your studio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="ml-2 text-sm font-medium text-green-600">{stat.change}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Client Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Emma Wilson</p>
                  <p className="text-sm text-gray-500">Joined Premium membership</p>
                </div>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-500">Attended Vinyasa class</p>
                </div>
                <span className="text-xs text-gray-400">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Lisa Chen</p>
                  <p className="text-sm text-gray-500">Booked private session</p>
                </div>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Classes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Morning Hatha Yoga</p>
                  <p className="text-sm text-gray-500">with Sarah Johnson</p>
                </div>
                <span className="text-xs text-gray-400">9:00 AM</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Power Vinyasa</p>
                  <p className="text-sm text-gray-500">with Mike Chen</p>
                </div>
                <span className="text-xs text-gray-400">6:00 PM</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Meditation Session</p>
                  <p className="text-sm text-gray-500">with Sarah Johnson</p>
                </div>
                <span className="text-xs text-gray-400">7:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}