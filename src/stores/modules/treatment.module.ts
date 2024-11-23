import { treatmentService } from '@/services/treatment.service'
import { defineStore } from 'pinia'

export const useTreatmentStore = defineStore('treatment', {
  state: () => ({
    treatments: [],
    isLoading: false,
  }),
  actions: {
    async getTreatmentList(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.getTreatmentList(id)
        this.treatments = response.data
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async toogleAppointment(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.toogleAppointment(id)
        this.isLoading = false
        this.treatments = response.data
        return await Promise.resolve(response.data)
      } catch (error) {
        return await Promise.reject(error)
      }
    },
    async doTreatment(id: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.doTreatment(id)
        this.isLoading = false
        this.treatments = response.data
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
    async addTreatmentDetail(data: any) {
      try {
        this.isLoading = true
        const response = await treatmentService.addTreatmentDetail(data)
        this.isLoading = false
        return await Promise.resolve(response.data)
      } catch (error) {
        this.isLoading = false
        return await Promise.reject(error)
      }
    },
  },
})
