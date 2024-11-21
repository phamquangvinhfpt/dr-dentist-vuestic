import appointmentService from '@/services/pharmaceutical.service'
import { defineStore } from 'pinia'

export const usePharmaceuticalStore = defineStore('pharmaceutical', {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    async getPharmaceuticals(search: any): Promise<any> {
      return appointmentService
        .getPharmaceuticals(search)
        .then((response) => {
          this.isLoading = true
          return Promise.resolve(response)
        })
        .catch((error) => {
          return Promise.reject(error)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
})
