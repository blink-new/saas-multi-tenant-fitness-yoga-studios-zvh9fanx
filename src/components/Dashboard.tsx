import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Settings, 
  Menu,
  X,
  LogOut,
  Calendar,
  UserCheck,
  Clock
} from 'lucide-react'
import { blink } from '../blink/client'
import DashboardOverview from './DashboardOverview'
import ClientManagement from './ClientManagement'
import TeacherManagement from './TeacherManagement'
import PaymentTracking from './PaymentTracking'
import StudioSettings from './StudioSettings'
import WeeklySchedule from './WeeklySchedule'
import EmployeeManagement from './EmployeeManagement'
import AttendanceManagement from './AttendanceManagement'

interface User {
  id: string
  email: string
  displayName?: string
}

interface DashboardProps {
  user: User
}

type ActiveTab = 'overview' | 'schedule' | 'clients' | 'teachers' | 'payments' | 'employees' | 'attendance' | 'settings'

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'teachers', name: 'Teachers', icon: GraduationCap },
    { id: 'employees', name: 'Employees', icon: UserCheck },
    { id: 'attendance', name: 'Attendance', icon: Clock },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />
      case 'schedule':
        return <WeeklySchedule />
      case 'clients':
        return <ClientManagement />
      case 'teachers':
        return <TeacherManagement />
      case 'employees':
        return <EmployeeManagement />
      case 'attendance':
        return <AttendanceManagement />
      case 'payments':
        return <PaymentTracking />
      case 'settings':
        return <StudioSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation, activeTab, setActiveTab, user }: {
  navigation: any[]
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  user: User
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-2xl font-bold text-indigo-600">ZenFlow Control</h1>
        </div>
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`${
                  activeTab === item.id
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.displayName || user.email}</p>
              <p className="text-xs text-gray-500">Studio Owner</p>
            </div>
          </div>
          <button
            onClick={() => blink.auth.logout()}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}