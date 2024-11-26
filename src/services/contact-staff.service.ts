import apiService from './api.service'
import type { ContactSearchParams, ContactResponse, Staff } from '@/pages/Contact-Info/types'
import { useAuthStore } from '@/stores/modules/auth.module'

class ContactStaffService {
  async getAllStaff(): Promise<Staff[]> {
    try {
      const response = await apiService.post('/users/get-staffs', {
        advancedSearch: {
          fields: [],
          keyword: '',
        },
        keyword: '',
        pageNumber: 0,
        pageSize: 100,
        orderBy: [],
        advancedFilter: {
          logic: 'and',
          filters: [
            {
              field: 'isActive',
              operator: 'eq',
              value: true,
            },
          ],
        },
        isActive: true,
      })

      console.log('Raw Staff response:', response.data.data)

      return (response.data.data || []).map((user: Staff) => {
        console.log('Mapping user:', user)
        return {
          id: user.id,
          name: user.userName || user.email,
        }
      })
    } catch (error) {
      console.error('Error in getAllStaff:', error)
      throw error
    }
  }

  async getAllContacts(filter: ContactSearchParams): Promise<ContactResponse> {
    const requestBody = {
      advancedSearch: {
        fields: filter.advancedSearch?.fields || [],
        keyword: filter.advancedSearch?.keyword || '',
      },
      keyword: filter.keyword || '',
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      orderBy: filter.orderBy || [],
    }

    try {
      const endpoint = filter.hasStaff ? '/customercontact/get-all' : '/customercontact/non-staff/get-all'

      const response = await apiService.post(endpoint, requestBody)
      return response.data
    } catch (error) {
      console.error('Error in getAllContacts:', error)
      throw error
    }
  }

  async addContact(data: { title: string; email: string; phone: string; content: string }): Promise<any> {
    try {
      const authStore = useAuthStore()
      const tenantId = authStore.user?.id

      const response = await apiService.post(`/customercontact/add?tenant=${tenantId || 'root'}`, data)
      return response.data
    } catch (error) {
      console.error('Error in addContact:', error)
      throw error
    }
  }

  async addStaffContact(data: { staffId: string; contactId: string }): Promise<any> {
    try {
      console.log('AddStaffContact Request:', {
        staffId: data.staffId,
        contactID: data.contactId,
      })

      const response = await apiService.post('/customercontact/add-staff', {
        staffId: data.staffId,
        contactID: data.contactId,
      })

      console.log('AddStaffContact Response:', response)

      if (!response.data) {
        throw new Error('No data returned from add-staff endpoint')
      }

      return response.data
    } catch (error) {
      console.error('Error in addStaffContact:', error)
      throw error
    }
  }

  async getMyContacts(filter: ContactSearchParams): Promise<ContactResponse> {
    const requestBody = {
      advancedSearch: {
        fields: filter.advancedSearch?.fields || [],
        keyword: filter.advancedSearch?.keyword || '',
      },
      keyword: filter.keyword || '',
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
      orderBy: filter.orderBy || [],
    }

    try {
      const response = await apiService.post('/customercontact/staff/get-all', requestBody)
      return response.data
    } catch (error) {
      console.error('Error in getMyContacts:', error)
      throw error
    }
  }
}

export default new ContactStaffService()
