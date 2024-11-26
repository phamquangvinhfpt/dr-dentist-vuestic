import contactService from '@/services/contact.service'
import { defineStore } from 'pinia'

export const useContactStore = defineStore('contact', {
  state: () => ({
    isLoading: false as boolean,
  }),
  actions: {
    async sendContactMessage(data: any): Promise<any> {
      try {
        this.isLoading = true
        const response = await contactService.sendContactMessage(data)
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async getContacts(): Promise<any> {
      try {
        this.isLoading = true
        const response = await contactService.getContacts()
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
