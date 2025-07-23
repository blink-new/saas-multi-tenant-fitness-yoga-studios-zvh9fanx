import React, { useState, useEffect } from 'react'
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react'
import { database, AttendanceRecord, Class, Teacher, Client, Employee } from '../lib/database'

export default function AttendanceManagement() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [personTypeFilter, setPersonTypeFilter] = useState<'all' | 'client' | 'teacher' | 'employee'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all')

  const loadData = async () => {
    try {
      const [attendanceData, classesData, teachersData, clientsData, employeesData] = await Promise.all([
        database.attendance.list(),
        database.classes.list(),
        database.teachers.list(),
        database.clients.list(),
        database.employees.list()
      ])
      
      setAttendanceRecords(attendanceData)
      setClasses(classesData)
      setTeachers(teachersData)
      setClients(clientsData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const markAttendance = async (personId: string, personType: 'teacher' | 'client' | 'employee', classId: string | undefined, status: 'present' | 'absent' | 'late') => {
    try {
      let personName = ''
      let className = ''

      // Get person name
      if (personType === 'teacher') {
        const teacher = teachers.find(t => t.id === personId)
        personName = teacher?.name || 'Unknown Teacher'
      } else if (personType === 'client') {
        const client = clients.find(c => c.id === personId)
        personName = client?.name || 'Unknown Client'
      } else if (personType === 'employee') {
        const employee = employees.find(e => e.id === personId)
        personName = employee?.name || 'Unknown Employee'
      }

      // Get class name if applicable
      if (classId) {
        const classItem = classes.find(c => c.id === classId)
        className = classItem?.name || 'Unknown Class'
      }

      const attendanceRecord = await database.attendance.create({
        person_id: personId,
        person_type: personType,
        person_name: personName,
        class_id: classId,
        class_name: className || undefined,
        date: selectedDate,
        status,
        notes: ''
      })

      setAttendanceRecords([...attendanceRecords, attendanceRecord])
    } catch (error) {
      console.error('Error marking attendance:', error)
    }
  }

  const updateAttendanceStatus = async (recordId: string, newStatus: 'present' | 'absent' | 'late') => {
    try {
      const updatedRecord = await database.attendance.update(recordId, { status: newStatus })
      setAttendanceRecords(attendanceRecords.map(record => 
        record.id === recordId ? { ...record, ...updatedRecord } : record
      ))
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const getClassesForDate = (date: string) => {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
    return classes.filter(c => c.day === dayOfWeek)
  }

  const getAttendanceForDateAndClass = (date: string, classId?: string) => {
    return attendanceRecords.filter(record => {
      const matchesDate = record.date === date
      const matchesClass = !classId || classId === 'all' || record.class_id === classId
      const matchesPersonType = personTypeFilter === 'all' || record.person_type === personTypeFilter
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      return matchesDate && matchesClass && matchesPersonType && matchesStatus
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'absent': return <XCircle className="w-5 h-5 text-red-500" />
      case 'late': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPersonTypeColor = (type: string) => {
    switch (type) {
      case 'teacher': return 'bg-purple-100 text-purple-800'
      case 'client': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const todaysClasses = getClassesForDate(selectedDate)
  const filteredAttendance = getAttendanceForDateAndClass(selectedDate, selectedClass)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track attendance for classes, teachers, clients, and employees</p>
        </div>
      </div>

      {/* Date and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Classes</option>
              {todaysClasses.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} ({classItem.start_time})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person Type
            </label>
            <select
              value={personTypeFilter}
              onChange={(e) => setPersonTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="client">Clients</option>
              <option value="teacher">Teachers</option>
              <option value="employee">Employees</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Mark Attendance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Mark Attendance</h2>
        
        {todaysClasses.length > 0 ? (
          <div className="space-y-4">
            {todaysClasses.map(classItem => (
              <div key={classItem.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">
                      {classItem.start_time} - {classItem.end_time} | {classItem.teacher_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAttendance(classItem.teacher_id, 'teacher', classItem.id, 'present')}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                    >
                      Mark Teacher Present
                    </button>
                  </div>
                </div>
                
                {/* Enrolled Clients */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Enrolled Clients:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {classItem.enrolled_clients.map(clientId => {
                      const client = clients.find(c => c.id === clientId)
                      if (!client) return null
                      
                      const hasAttendance = attendanceRecords.some(
                        record => record.person_id === clientId && 
                                 record.class_id === classItem.id && 
                                 record.date === selectedDate
                      )
                      
                      return (
                        <div key={clientId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{client.name}</span>
                          {!hasAttendance && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => markAttendance(clientId, 'client', classItem.id, 'present')}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                              >
                                Present
                              </button>
                              <button
                                onClick={() => markAttendance(clientId, 'client', classItem.id, 'late')}
                                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
                              >
                                Late
                              </button>
                              <button
                                onClick={() => markAttendance(clientId, 'client', classItem.id, 'absent')}
                                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                              >
                                Absent
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes scheduled</h3>
            <p className="text-gray-600">No classes are scheduled for {selectedDate}</p>
          </div>
        )}
      </div>

      {/* Employee Daily Attendance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Daily Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map(employee => {
            const hasAttendance = attendanceRecords.some(
              record => record.person_id === employee.id && 
                       record.person_type === 'employee' && 
                       record.date === selectedDate
            )
            
            return (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({employee.role})</span>
                </div>
                {!hasAttendance && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => markAttendance(employee.id, 'employee', undefined, 'present')}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(employee.id, 'employee', undefined, 'absent')}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      Absent
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
          <p className="text-sm text-gray-600">
            Showing {filteredAttendance.length} records for {selectedDate}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {record.person_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPersonTypeColor(record.person_type)}`}>
                      {record.person_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.class_name || 'Daily Attendance'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateAttendanceStatus(record.id, 'present')}
                        className="text-green-600 hover:text-green-900"
                        disabled={record.status === 'present'}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => updateAttendanceStatus(record.id, 'late')}
                        className="text-yellow-600 hover:text-yellow-900 ml-2"
                        disabled={record.status === 'late'}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => updateAttendanceStatus(record.id, 'absent')}
                        className="text-red-600 hover:text-red-900 ml-2"
                        disabled={record.status === 'absent'}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
            <p className="text-gray-600">No attendance has been marked for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  )
}