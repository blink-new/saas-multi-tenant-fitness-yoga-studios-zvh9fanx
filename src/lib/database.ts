import { blink } from '../blink/client'

// Type definitions
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: string;
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  payment_plan: 'monthly' | 'quarterly' | 'semester' | 'annual';
  payment_amount: number;
  next_payment_date: string;
  payment_status: 'active' | 'overdue' | 'suspended';
  notes: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  experience_level: string;
  status: 'active' | 'inactive';
  hourly_rate: number;
  color: string;
  bio: string;
}

export interface Class {
  id: string;
  name: string;
  teacher_id: string;
  teacher_name: string;
  day: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_enrollment: number;
  description: string;
  type: string;
  price: number;
  status: 'active' | 'cancelled';
  enrolled_clients: string[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  permissions: string[];
  status: 'active' | 'inactive';
  hire_date: string;
}

export interface AttendanceRecord {
  id: string;
  person_id: string;
  person_type: 'teacher' | 'client' | 'employee';
  person_name: string;
  class_id?: string;
  class_name?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  client_id: string;
  client_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'transfer';
  notes?: string;
}

// Database abstraction layer for ZenFlow Control
export const database = {
  clients: {
    async list(): Promise<Client[]> {
      // Mock data with payment plans
      return [
        {
          id: '1',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          phone: '+1 (555) 123-4567',
          membership_type: 'Premium',
          status: 'active',
          join_date: '2023-01-15',
          payment_plan: 'monthly',
          payment_amount: 150,
          next_payment_date: '2024-02-15',
          payment_status: 'active',
          notes: 'Prefers morning classes'
        },
        {
          id: '2',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1 (555) 234-5678',
          membership_type: 'Basic',
          status: 'active',
          join_date: '2023-03-20',
          payment_plan: 'quarterly',
          payment_amount: 400,
          next_payment_date: '2024-01-20',
          payment_status: 'overdue',
          notes: 'Beginner level'
        },
        {
          id: '3',
          name: 'Lisa Chen',
          email: 'lisa@example.com',
          phone: '+1 (555) 345-6789',
          membership_type: 'Premium',
          status: 'active',
          join_date: '2023-05-10',
          payment_plan: 'annual',
          payment_amount: 1500,
          next_payment_date: '2024-05-10',
          payment_status: 'active',
          notes: 'Advanced practitioner'
        }
      ]
    },
    async create(data: Partial<Client>) {
      console.log('Creating client:', data)
      return { id: Date.now().toString(), ...data } as Client
    },
    async update(id: string, data: Partial<Client>) {
      console.log('Updating client:', id, data)
      return { id, ...data } as Client
    },
    async delete(id: string) {
      console.log('Deleting client:', id)
      return true
    }
  },
  
  teachers: {
    async list(): Promise<Teacher[]> {
      return [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1 (555) 123-4567',
          specialties: ['Hatha Yoga', 'Meditation'],
          experience_level: '5+ years',
          status: 'active',
          hourly_rate: 75,
          color: '#10B981', // Green
          bio: 'Certified yoga instructor with 8 years of experience'
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          phone: '+1 (555) 234-5678',
          specialties: ['Vinyasa', 'Power Yoga'],
          experience_level: '3-5 years',
          status: 'active',
          hourly_rate: 65,
          color: '#3B82F6', // Blue
          bio: 'Dynamic instructor specializing in flow sequences'
        },
        {
          id: '3',
          name: 'Anna Rodriguez',
          email: 'anna@example.com',
          phone: '+1 (555) 345-6789',
          specialties: ['Pilates', 'Strength Training'],
          experience_level: '3-5 years',
          status: 'active',
          hourly_rate: 70,
          color: '#8B5CF6', // Purple
          bio: 'Pilates expert with focus on core strength'
        }
      ]
    },
    async create(data: Partial<Teacher>) {
      console.log('Creating teacher:', data)
      return { id: Date.now().toString(), ...data } as Teacher
    },
    async update(id: string, data: Partial<Teacher>) {
      console.log('Updating teacher:', id, data)
      return { id, ...data } as Teacher
    },
    async delete(id: string) {
      console.log('Deleting teacher:', id)
      return true
    }
  },
  
  classes: {
    async list(): Promise<Class[]> {
      return [
        {
          id: '1',
          name: 'Morning Vinyasa',
          teacher_id: '1',
          teacher_name: 'Sarah Johnson',
          day: 'Monday',
          start_time: '08:00',
          end_time: '09:00',
          max_capacity: 20,
          current_enrollment: 15,
          description: 'Energizing flow to start your week',
          type: 'Yoga',
          price: 25,
          status: 'active',
          enrolled_clients: ['1', '2', '3']
        },
        {
          id: '2',
          name: 'Power Yoga',
          teacher_id: '2',
          teacher_name: 'Mike Chen',
          day: 'Tuesday',
          start_time: '18:00',
          end_time: '19:00',
          max_capacity: 15,
          current_enrollment: 12,
          description: 'High-intensity yoga for strength building',
          type: 'Yoga',
          price: 30,
          status: 'active',
          enrolled_clients: ['1', '3']
        },
        {
          id: '3',
          name: 'Pilates Core',
          teacher_id: '3',
          teacher_name: 'Anna Rodriguez',
          day: 'Wednesday',
          start_time: '10:00',
          end_time: '11:00',
          max_capacity: 12,
          current_enrollment: 8,
          description: 'Focus on core strength and stability',
          type: 'Pilates',
          price: 28,
          status: 'active',
          enrolled_clients: ['2']
        },
        {
          id: '4',
          name: 'Early Bird Yoga',
          teacher_id: '1',
          teacher_name: 'Sarah Johnson',
          day: 'Friday',
          start_time: '06:00',
          end_time: '07:00',
          max_capacity: 15,
          current_enrollment: 8,
          description: 'Start your day with gentle stretches',
          type: 'Yoga',
          price: 20,
          status: 'active',
          enrolled_clients: ['1']
        },
        {
          id: '5',
          name: 'Evening Flow',
          teacher_id: '2',
          teacher_name: 'Mike Chen',
          day: 'Thursday',
          start_time: '19:30',
          end_time: '20:30',
          max_capacity: 18,
          current_enrollment: 14,
          description: 'Unwind with a relaxing flow',
          type: 'Yoga',
          price: 25,
          status: 'active',
          enrolled_clients: ['2', '3']
        }
      ]
    },
    async create(data: Partial<Class>) {
      console.log('Creating class:', data)
      return { id: Date.now().toString(), ...data } as Class
    },
    async update(id: string, data: Partial<Class>) {
      console.log('Updating class:', id, data)
      return { id, ...data } as Class
    },
    async delete(id: string) {
      console.log('Deleting class:', id)
      return true
    }
  },
  
  employees: {
    async list(): Promise<Employee[]> {
      return [
        {
          id: '1',
          name: 'Alex Manager',
          email: 'alex@zenyoga.com',
          role: 'manager',
          permissions: ['all'],
          status: 'active',
          hire_date: '2023-01-01'
        },
        {
          id: '2',
          name: 'Jamie Assistant',
          email: 'jamie@zenyoga.com',
          role: 'employee',
          permissions: ['clients', 'teachers'],
          status: 'active',
          hire_date: '2023-06-15'
        }
      ]
    },
    async create(data: Partial<Employee>) {
      console.log('Creating employee:', data)
      return { id: Date.now().toString(), ...data } as Employee
    },
    async update(id: string, data: Partial<Employee>) {
      console.log('Updating employee:', id, data)
      return { id, ...data } as Employee
    },
    async delete(id: string) {
      console.log('Deleting employee:', id)
      return true
    }
  },
  
  attendance: {
    async list(): Promise<AttendanceRecord[]> {
      return [
        {
          id: '1',
          person_id: '1',
          person_type: 'client',
          person_name: 'Emma Wilson',
          class_id: '1',
          class_name: 'Morning Vinyasa',
          date: '2024-01-22',
          status: 'present',
          notes: ''
        },
        {
          id: '2',
          person_id: '1',
          person_type: 'teacher',
          person_name: 'Sarah Johnson',
          class_id: '1',
          class_name: 'Morning Vinyasa',
          date: '2024-01-22',
          status: 'present',
          notes: ''
        },
        {
          id: '3',
          person_id: '2',
          person_type: 'employee',
          person_name: 'Jamie Assistant',
          date: '2024-01-22',
          status: 'present',
          notes: 'Full day shift'
        }
      ]
    },
    async create(data: Partial<AttendanceRecord>) {
      console.log('Creating attendance record:', data)
      return { id: Date.now().toString(), ...data } as AttendanceRecord
    },
    async update(id: string, data: Partial<AttendanceRecord>) {
      console.log('Updating attendance record:', id, data)
      return { id, ...data } as AttendanceRecord
    }
  },
  
  paymentRecords: {
    async list(): Promise<PaymentRecord[]> {
      return [
        {
          id: '1',
          client_id: '1',
          client_name: 'Emma Wilson',
          amount: 150,
          payment_date: '2024-01-15',
          payment_method: 'card',
          notes: 'Monthly Premium Membership'
        },
        {
          id: '2',
          client_id: '2',
          client_name: 'John Smith',
          amount: 400,
          payment_date: '2023-10-20',
          payment_method: 'transfer',
          notes: 'Quarterly payment - OVERDUE'
        },
        {
          id: '3',
          client_id: '3',
          client_name: 'Lisa Chen',
          amount: 1500,
          payment_date: '2023-05-10',
          payment_method: 'card',
          notes: 'Annual membership payment'
        }
      ]
    },
    async create(data: Partial<PaymentRecord>) {
      console.log('Creating payment record:', data)
      return { id: Date.now().toString(), ...data } as PaymentRecord
    }
  },
  
  payments: {
    async list() {
      const records = await database.paymentRecords.list()
      return records.map(record => ({
        id: record.id,
        client_id: record.client_id,
        client_name: record.client_name,
        amount: record.amount,
        type: 'membership',
        status: 'completed',
        date: record.payment_date,
        description: record.notes || 'Payment'
      }))
    }
  },
  
  studio: {
    async getProfile() {
      return {
        name: 'Zen Yoga Studio',
        email: 'info@zenyoga.com',
        phone: '+1 (555) 987-6543',
        address: '123 Wellness Street, Mindful City, MC 12345',
        website: 'https://zenyoga.com',
        description: 'A peaceful sanctuary for yoga and wellness practices.'
      }
    },
    async updateProfile(data: any) {
      console.log('Updating studio profile:', data)
      return data
    }
  }
}