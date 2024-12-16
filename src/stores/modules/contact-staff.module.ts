import { defineStore } from 'pinia'
import type { ContactInfo, ContactSearchParams, Staff } from '@/pages/Contact-Info/types'
import contactStaffService from '@/services/contact-staff.service'

interface ContactStaffState {
  contacts: ContactInfo[]
  totalContacts: number
  currentPage: number
  pageSize: number
  isLoading: boolean
  staffList: Staff[]
}

export const useContactStaffStore = defineStore('contactStaff', {
  state: (): ContactStaffState => ({
    contacts: [],
    totalContacts: 0,
    currentPage: 1,
    pageSize: 10,
    isLoading: false,
    staffList: [],
  }),

  actions: {
    async getAllContacts(filter: ContactSearchParams) {
      try {
        this.isLoading = true
        const response = await contactStaffService.getAllContacts({
          pageNumber: filter.pageNumber,
          pageSize: filter.pageSize,
          hasStaff: filter.hasStaff,
          orderBy: filter.orderBy,
          keyword: filter.keyword,
          advancedSearch: filter.advancedSearch,
        })

        this.contacts = response.data
        this.totalContacts = response.totalCount
        this.currentPage = response.currentPage
        this.pageSize = response.pageSize

        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async addContact(data: { title: string; email: string; phone: string; content: string }) {
      try {
        this.isLoading = true
        const response = await contactStaffService.addContact(data)
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async addStaffContact(staffId: string, contactId: string) {
      try {
        this.isLoading = true
        console.log('Store sending staff assignment:', { staffId, contactId })
        const response = await contactStaffService.addStaffContact({
          staffId,
          contactId,
        })
        console.log('Store received assignment response:', response)
        return Promise.resolve(response)
      } catch (error) {
        console.error('Store error assigning staff:', error)
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async getAllStaff() {
      try {
        this.isLoading = true
        const response = await contactStaffService.getAllStaff()
        console.log('Store received staff:', response)
        this.staffList = response
        return Promise.resolve(response)
      } catch (error) {
        console.error('Store error getting staff:', error)
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async getMyContacts(filter: ContactSearchParams) {
      try {
        this.isLoading = true
        const response = await contactStaffService.getMyContacts({
          pageNumber: filter.pageNumber,
          pageSize: filter.pageSize,
          orderBy: filter.orderBy,
          keyword: filter.keyword,
          advancedSearch: filter.advancedSearch,
        })

        this.contacts = response.data
        this.totalContacts = response.totalCount
        this.currentPage = response.currentPage
        this.pageSize = response.pageSize

        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async updateCallImage(contactId: string, files: File[]) {
      try {
        this.isLoading = true
        const response = await contactStaffService.updateCallImage(contactId, files)
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async sendEmail(contactId: string, emailContext: string) {
      try {
        this.isLoading = true
        const response = await contactStaffService.sendEmail(contactId, emailContext)
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
