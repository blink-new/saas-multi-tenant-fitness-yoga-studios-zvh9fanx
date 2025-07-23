import React, { useState, useEffect } from 'react'
import { Plus, Users, Clock, Edit, Trash2 } from 'lucide-react'
import { database, Class, Teacher } from '../lib/database'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOURS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 5 // Start from 5 AM
  return `${hour.toString().padStart(2, '0')}:00`
})

interface ClassFormData {
  name: string
  teacher_id: string
  day: string
  start_time: string
  end_time: string
  max_capacity: number
  description: string
  type: string
  price: number
}

export default function WeeklySchedule() {
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    teacher_id: '',
    day: 'Monday',
    start_time: '08:00',
    end_time: '09:00',
    max_capacity: 15,
    description: '',
    type: 'Yoga',
    price: 25
  })

  const loadData = async () => {
    const [classesData, teachersData] = await Promise.all([
      database.classes.list(),
      database.teachers.list()
    ])
    setClasses(classesData)
    setTeachers(teachersData)
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      teacher_id: '',
      day: 'Monday',
      start_time: '08:00',
      end_time: '09:00',
      max_capacity: 15,
      description: '',
      type: 'Yoga',
      price: 25
    })
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedTeacher = teachers.find(t => t.id === formData.teacher_id)
    if (!selectedTeacher) return

    const newClass = await database.classes.create({
      ...formData,
      teacher_name: selectedTeacher.name,
      current_enrollment: 0,
      status: 'active',
      enrolled_clients: []
    })

    setClasses([...classes, newClass])
    setShowCreateModal(false)
    resetForm()
  }

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClass) return

    const selectedTeacher = teachers.find(t => t.id === formData.teacher_id)
    if (!selectedTeacher) return

    const updatedClass = await database.classes.update(editingClass.id, {
      ...formData,
      teacher_name: selectedTeacher.name
    })

    setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...updatedClass } : c))
    setEditingClass(null)
    resetForm()
  }

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      await database.classes.delete(classId)
      setClasses(classes.filter(c => c.id !== classId))
    }
  }

  const openEditModal = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      teacher_id: classItem.teacher_id,
      day: classItem.day,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      max_capacity: classItem.max_capacity,
      description: classItem.description,
      type: classItem.type,
      price: classItem.price
    })
  }

  const getClassesForDayAndHour = (day: string, hour: string) => {
    return classes.filter(c => {
      const classHour = c.start_time.split(':')[0].padStart(2, '0') + ':00'
      return c.day === day && classHour === hour
    })
  }

  const getTeacherColor = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher?.color || '#6366F1'
  }

  const calculateClassHeight = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(':')[0])
    const startMin = parseInt(startTime.split(':')[1])
    const end = parseInt(endTime.split(':')[0])
    const endMin = parseInt(endTime.split(':')[1])
    
    const duration = (end * 60 + endMin) - (start * 60 + startMin)
    return Math.max(60, (duration / 60) * 60) // Minimum 60px height
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
          <p className="text-gray-600">Visual grid schedule from 5:00 AM to 9:00 PM</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="p-3 text-sm font-medium text-gray-700 border-r">Time</div>
              {DAYS.map(day => (
                <div key={day} className="p-3 text-sm font-medium text-gray-700 text-center border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                {/* Time column */}
                <div className="p-3 text-sm text-gray-600 border-r bg-gray-50 flex items-center">
                  {hour}
                </div>
                
                {/* Day columns */}
                {DAYS.map(day => {
                  const dayClasses = getClassesForDayAndHour(day, hour)
                  return (
                    <div key={`${day}-${hour}`} className="border-r last:border-r-0 p-1 relative min-h-[60px]">
                      {dayClasses.map(classItem => {
                        const teacherColor = getTeacherColor(classItem.teacher_id)
                        const height = calculateClassHeight(classItem.start_time, classItem.end_time)
                        
                        return (
                          <div
                            key={classItem.id}
                            className="absolute inset-x-1 rounded-md p-2 text-xs text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                            style={{
                              backgroundColor: teacherColor,
                              height: `${height}px`,
                              zIndex: 10
                            }}
                            onClick={() => openEditModal(classItem)}
                          >
                            <div className="font-medium truncate">{classItem.name}</div>
                            <div className="opacity-90 truncate">{classItem.teacher_name}</div>
                            <div className="opacity-75 text-xs">
                              {classItem.start_time} - {classItem.end_time}
                            </div>
                            <div className="flex items-center gap-1 mt-1 opacity-75">
                              <Users className="w-3 h-3" />
                              <span>{classItem.current_enrollment}/{classItem.max_capacity}</span>
                            </div>
                            
                            {/* Hover actions */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditModal(classItem)
                                }}
                                className="p-1 bg-white/20 rounded hover:bg-white/30"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClass(classItem.id)
                                }}
                                className="p-1 bg-white/20 rounded hover:bg-white/30"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Legend */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Teacher Colors</h3>
        <div className="flex flex-wrap gap-3">
          {teachers.map(teacher => (
            <div key={teacher.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: teacher.color }}
              />
              <span className="text-sm text-gray-700">{teacher.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Class Modal */}
      {(showCreateModal || editingClass) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h2>
              
              <form onSubmit={editingClass ? handleEditClass : handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Yoga">Yoga</option>
                      <option value="Pilates">Pilates</option>
                      <option value="Meditation">Meditation</option>
                      <option value="Fitness">Fitness</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="05:00"
                      max="21:00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="05:00"
                      max="21:00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      max="50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {editingClass ? 'Update Class' : 'Create Class'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingClass(null)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}