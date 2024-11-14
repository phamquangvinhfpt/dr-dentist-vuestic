import serviceService from '@/services/service.service'
import { defineStore } from 'pinia'

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [],
    isLoading: false,
  }),
  actions: {
    async getAllCustomerServices() {
      try {
        this.isLoading = true
        const response = await serviceService.getAllCustomerServices()
        this.services = response.data
        this.isLoading = false
        return await Promise.resolve(response)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
