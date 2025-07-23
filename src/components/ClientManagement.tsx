import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import { database, Client } from '../lib/database'

interface ClientFormData {
  name: string
  email: string
  phone: string
  membership_type: string
  status: 'active' | 'inactive' | 'suspended'
  payment_plan: 'monthly' | 'quarterly' | 'semester' | 'annual'
  payment_amount: number
  next_payment_date: string
  payment_status: 'active' | 'overdue' | 'suspended'
  notes: string
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'active' | 'overdue' | 'suspended'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    membership_type: 'Basic',
    status: 'active',
    payment_plan: 'monthly',
    payment_amount: 100,
    next_payment_date: '',
    payment_status: 'active',
    notes: ''
  })

  const loadClients = async () => {
    try {
      const data = await database.clients.list()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const resetForm = () => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      membership_type: 'Basic',
      status: 'active',
      payment_plan: 'monthly',
      payment_amount: 100,
      next_payment_date: nextMonth.toISOString().split('T')[0],
      payment_status: 'active',
      notes: ''
    })
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newClient = await database.clients.create({
        ...formData,
        join_date: new Date().toISOString().split('T')[0]
      })
      setClients([...clients, newClient])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating client:', error)
    }
  }

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return
    
    try {
      const updatedClient = await database.clients.update(editingClient.id, formData)
      setClients(clients.map(client => 
        client.id === editingClient.id ? { ...client, ...updatedClient } : client
      ))
      setEditingClient(null)
      resetForm()
    } catch (error) {
      console.error('Error updating client:', error)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await database.clients.delete(clientId)
        setClients(clients.filter(client => client.id !== clientId))
      } catch (error) {
        console.error('Error deleting client:', error)
      }
    }
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      membership_type: client.membership_type,
      status: client.status,
      payment_plan: client.payment_plan,
      payment_amount: client.payment_amount,
      next_payment_date: client.next_payment_date,
      payment_status: client.payment_status,
      notes: client.notes
    })
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === 'all' || client.payment_status === paymentStatusFilter
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Monthly'
      case 'quarterly': return 'Quarterly'
      case 'semester': return 'Semester'
      case 'annual': return 'Annual'
      default: return plan
    }
  }

  const isPaymentOverdue = (nextPaymentDate: string) => {
    return new Date(nextPaymentDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage your studio's clients and their payment plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Payments</option>
            <option value="active">Current</option>
            <option value="overdue">Overdue</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      <div className="grid gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    {client.payment_status === 'overdue' && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {client.join_date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {client.membership_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(client.payment_status)}`}>
                      {client.payment_status}
                    </span>
                  </div>
                  
                  {/* Payment Plan Info */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Payment Plan:</span>
                        <div className="font-medium">{getPlanLabel(client.payment_plan)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <div className="font-medium flex items-center">
                          <DollarSign className="w-4 h-4" />
                          {client.payment_amount}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Payment:</span>
                        <div className={`font-medium ${isPaymentOverdue(client.next_payment_date) ? 'text-red-600' : ''}`}>
                          {client.next_payment_date}
                          {isPaymentOverdue(client.next_payment_date) && (
                            <span className="text-red-500 ml-1">(Overdue)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">{client.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(client)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first client to get started'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Client Modal */}
      {(showCreateModal || editingClient) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              
              <form onSubmit={editingClient ? handleEditClient : handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membership Type
                    </label>
                    <select
                      value={formData.membership_type}
                      onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={formData.payment_status}
                      onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Current</option>
                      <option value="overdue">Overdue</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Plan
                    </label>
                    <select
                      value={formData.payment_plan}
                      onChange={(e) => setFormData({ ...formData, payment_plan: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semester">Semester</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.payment_amount}
                      onChange={(e) => setFormData({ ...formData, payment_amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.next_payment_date}
                      onChange={(e) => setFormData({ ...formData, next_payment_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Additional notes about the client..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {editingClient ? 'Update Client' : 'Add Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingClient(null)
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