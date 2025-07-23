import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Mail, Shield, User } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { database } from '../lib/database'

interface Employee {
  id: string
  name: string
  email: string
  role: 'manager' | 'employee'
  permissions: string[]
  status: 'active' | 'inactive'
  hire_date: string
}

const AVAILABLE_PERMISSIONS = [
  { id: 'clients', label: 'Client Management', description: 'View and manage client records' },
  { id: 'teachers', label: 'Teacher Management', description: 'View and manage teacher profiles' },
  { id: 'schedule', label: 'Schedule Management', description: 'Create and manage class schedules' },
  { id: 'payments', label: 'Payment Tracking', description: 'View payment records and analytics' },
  { id: 'settings', label: 'Studio Settings', description: 'Modify studio profile and settings' },
  { id: 'employees', label: 'Employee Management', description: 'Manage other employees (managers only)' }
]

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as 'manager' | 'employee',
    permissions: [] as string[],
    status: 'active' as 'active' | 'inactive'
  })

  const loadEmployees = async () => {
    try {
      const data = await database.employees.list()
      setEmployees(data)
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      permissions: [],
      status: 'active'
    })
  }

  const handleCreateEmployee = async () => {
    try {
      const newEmployee: Employee = {
        id: `emp_${Date.now()}`,
        ...formData,
        hire_date: new Date().toISOString().split('T')[0]
      }
      
      await database.employees.create(newEmployee)
      setEmployees([...employees, newEmployee])
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating employee:', error)
    }
  }

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return
    
    try {
      const updatedEmployee = { ...selectedEmployee, ...formData }
      await database.employees.update(selectedEmployee.id, updatedEmployee)
      setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? updatedEmployee : emp))
      setIsEditModalOpen(false)
      setSelectedEmployee(null)
      resetForm()
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await database.employees.delete(employeeId)
      setEmployees(employees.filter(emp => emp.id !== employeeId))
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      permissions: employee.permissions,
      status: employee.status
    })
    setIsEditModalOpen(true)
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId]
      })
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permissionId)
      })
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getRoleColor = (role: string) => {
    return role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage staff access and permissions</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: 'manager' | 'employee') => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="space-y-3 mt-2">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                        disabled={formData.role === 'manager' && permission.id !== 'employees'}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                  {formData.role === 'manager' && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      Managers automatically have access to all permissions except employee management.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateEmployee} className="flex-1">
                  Add Employee
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleColor(employee.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {employee.role}
                      </Badge>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(employee)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  <strong>Permissions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {employee.role === 'manager' ? (
                      <Badge variant="outline" className="text-xs">All Permissions</Badge>
                    ) : (
                      employee.permissions.map(permissionId => {
                        const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId)
                        return permission ? (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission.label}
                          </Badge>
                        ) : null
                      })
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Hired: {new Date(employee.hire_date).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first employee to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'manager' | 'employee') => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="space-y-3 mt-2">
                {AVAILABLE_PERMISSIONS.map(permission => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`edit-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      disabled={formData.role === 'manager' && permission.id !== 'employees'}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                        {permission.label}
                      </Label>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
                {formData.role === 'manager' && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    Managers automatically have access to all permissions except employee management.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditEmployee} className="flex-1">
                Update Employee
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}